#!/usr/bin/env bash


# taken from mailcow update.sh
# Check permissions
if [ "$(id -u)" -ne "0" ]; then
  echo "You need to be root"
  exit 1
fi

check_online_status() {
  CHECK_ONLINE_IPS=(1.1.1.1 9.9.9.9 8.8.8.8)
  for ip in "${CHECK_ONLINE_IPS[@]}"; do
    if timeout 3 ping -c 1 ${ip} > /dev/null; then
      return 0
    fi
  done
  return 1
}
#end

get_main_entries() {

}