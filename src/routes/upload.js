const formidable = require('formidable');
const fileSettings = require('../utils/fileSettings');
const { models } = require('../db/connector');
const mimeType = require('mime-types');
const AmazonCDN = require('../utils/awsConnector');
const VirusTotalApi = require('virustotal-api');

const s3A = new AmazonCDN();
const virusTotal = new VirusTotalApi({ apiKey: 'temp' });

async function scanForViruses(file) {
    return new Promise((resolve, reject) => {
        virusTotal.fileScan(file.path, (err, res) => {
            if (err) {
                console.error("Error scanning for viruses:", err);
                resolve(false);
            } else {
                const scanResult = res.data.attributes.last_analysis_stats;
                const detected = scanResult.detected;
                resolve(!detected);
            }
        });
    });
}

async function fetchUserStorageInfo(userId) {
    try {
        const response = await axios.get(`https://mail.cyci.org/api/v1/storage/${userId}`, {
            headers: {
                Authorization: 'Bearer YOUR_MAILCOW_API_TOKEN'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user storage information:', error.response.data);
        throw new Error('Failed to fetch user storage information from Mailcow API');
    }
}

async function post(req, res) {
    res.setHeader('Content-Type', 'text/text');
    
    const form = new formidable.IncomingForm();
    const userHeaderInformation = req.headers;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (isIPBlacklisted(ip)) {
        return res.status(403).json({ error: 'Your IP is blacklisted. Please contact support for assistance.' });
    }

    if (!userHeaderInformation['x-user-email'] || !userHeaderInformation['x-user-id'] || !userHeaderInformation['x-user-api-token']) {
        return res.status(401).json({ error: `Unauthorized request` });
    }

    const account = await models.User.findByEmailOrId({ email: userHeaderInformation['x-user-email'], userid: userHeaderInformation['x-user-id'] });

    if (!account) {
        return res.status(401).json({ error: `Unauthorized request. User does not exist.` });
    }

    if (account.api_token !== userHeaderInformation['x-user-api-token']) {
        return res.status(401).json({ error: `Unauthorized request. User API token is invalid.` });
    }

    let userStorageInfo;
    try {
        userStorageInfo = await fetchUserStorageInfo(account.email);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user storage information.' });
    }

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({ error: `Error parsing form.` });
        }

        if (!files.cyciUploader) {
            return res.status(400).json({ error: `No file provided.` });
        }

        const file = files.cyciUploader;

        if (!file.size) {
            return res.status(400).json({ error: `File is empty.` });
        }

        if (file.size > fileSettings.maxFileSize) {
            return res.status(400).json({ error: `File is too large.` });
        }

        if (!fields.key) {
            return res.status(400).json({ error: `Not using Sharex Uploader` });
        }

        const mimeFile = mimeType.extension(file.mimetype);

        if (!fileSettings.extensions.includes(mimeFile)) {
            return res.status(400).json({ error: `Invalid mime-type` });
        }

        const fileData = {
            fileName: file.originalFilename,
            fileType: file.type,
            fileSize: file.size,
            filePath: file.filepath,
            fileExtension: file.originalFilename.substring(file.originalFilename.lastIndexOf('.') + 1, file.originalFilename.length).toLowerCase()
        };

        if (userStorageInfo.usedStorage + file.size > userStorageInfo.storageQuota) {
            return res.status(400).json({ error: `User has exceeded their storage quota.` });
        }

        if (!await scanForViruses(file)) {
            return res.status(400).json({ error: `File contains viruses.` });
        }

        const fileUpload = await s3A.uploadImage(account, fileData, fileData.filePath);

        models.User.addImageOrFile(account, {
            name: fileData.fileName,
            id: fileUpload.id,
            value: fileUpload.url,
            size: fileData.fileSize,
            type: fileData.fileExtension,
            created_at: fileUpload.fileDateUpload
        }, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: `Error adding file to database.` });
            }
            return res.status(200).json({ cyciUploader: `https://${fileUpload.url}` });
        });
    });
}

module.exports = { post };
