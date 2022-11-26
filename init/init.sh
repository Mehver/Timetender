if [ ! -f /usr/lib/timetender/config/timetender.json ]; then
  cp /usr/lib/timetender/init/config/timetender.json /usr/lib/timetender/config/timetender.json
fi
if [ ! -f /usr/lib/timetender/data/data.json ]; then
  cp /usr/lib/timetender/init/data/data.json /usr/lib/timetender/data/data.json
fi
if [ ! -f /usr/lib/timetender/data/data_auto-save.json ]; then
  cp /usr/lib/timetender/init/data/data_auto-save.json /usr/lib/timetender/data/data_auto-save.json
fi
if [ ! -f /usr/lib/timetender/data/event.json ]; then
  cp /usr/lib/timetender/init/data/event.json /usr/lib/timetender/data/event.json
fi
if [ ! -f /usr/lib/timetender/data/tag.json ]; then
  cp /usr/lib/timetender/init/data/tag.json /usr/lib/timetender/data/tag.json
fi
node /usr/lib/timetender/server.js



