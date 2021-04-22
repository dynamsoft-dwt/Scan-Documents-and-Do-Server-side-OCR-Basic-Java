# Scan-Documents-and-Do-Server-side-OCR-Basic-Java

## Description

This sample demonstrates how to use Dynamic Web TWAIN's OCR Basic add-on to do OCR on the server side running Java. 

    ## Compatibility

The Server must be Windows with Java Support, client can run Windows/Mac/Linux

## Test Environment

OS: `Windows 10` Server: `Tomcat 9.0.24 (64bit)` Eclipse: `Oxygen.3a Release (4.7.3a)` JRE: `1.8.0_221`

## How to install the OCR engine on the server

On the server or your development machine

1. Download the OCR Basic resources from [here](https://tst.dynamsoft.com/libs/dwt/15.1/OCRResources/java-lib.zip).

2. Unzip `java-lib.zip` and copy all the files to `~\Scan-Documents-and-Do-Server-side-OCR-Basic-Java\Sample\WebContent\WEB-INF\lib`.

## How to test it

Option 1: 

Open /Sample/.project in Eclipse, add a runtime server (Tomcat) and start it. Then naviate to `http://localhost:8080/ScanDocumentsAndDoOCR/OCRBasicServerSide.html`.

Option 2:

Copy folder /Sample/src/com to /Sample/WebContent/WEB-INF/classes

Deploy the sample in `\Sample\WebContent\` to Tomcat (typically under `C:\Program Files (x86)\Apache Software Foundation\Tomcat 9.0\webapps`) and navigate to `http://localhost:8080/WebContent/OCRBasicServerSide.html`.

## References:

* [Dynamic Web TWAIN][1]
* [Dynamsoft OCR Engine][2]

[1]:https://www.dynamsoft.com/Products/WebTWAIN_Overview.aspx
[2]:http://www.dynamsoft.com/Products/image-to-text-web-application.aspx

Should you need any technical help, please write to support@dynamsoft.com.