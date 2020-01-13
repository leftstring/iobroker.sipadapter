echo ------------ build ------------
call npm run build
echo ------------ pack ------------
call npm pack
echo ------------ copy ------------
Xcopy "iobroker.sipadapter-0.9.0.tgz" "C:\Program Files\iobroker\SmartHome\node_modules\iobroker.sipadapter-0.9.0.tgz" /y
echo ------------ unpack ------------
cd "C:\Program Files\iobroker\SmartHome\node_modules"
call npm i "iobroker.sipadapter-0.9.0.tgz"
call "C:\Program Files\iobroker\SmartHome\nodejs\nodevars.bat"
iobroker upload sipadapter
pause