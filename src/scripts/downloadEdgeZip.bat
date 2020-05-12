node retrieveDownloadLink.js > url.txt
set /p url= < url.txt
curl "%url%" --output edge.zip
del url.txt