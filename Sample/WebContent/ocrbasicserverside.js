window.onload = function () {
	Dynamsoft.WebTwainEnv.AutoLoad = false;
	Dynamsoft.WebTwainEnv.Containers = [{ ContainerId: 'dwtcontrolContainer', Width: '100%', Height: '600px' }];
	Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady', Dynamsoft_OnReady);
	/**
	 * In order to use the full version, do the following
	 * 1. Change Dynamsoft.WebTwainEnv.Trial to false
	 * 2. Replace A-Valid-Product-Key with a full version key
	 * 3. Change Dynamsoft.WebTwainEnv.ResourcesPath to point to the full version 
	 *    resource files that you obtain after purchasing a key
	 */
	Dynamsoft.WebTwainEnv.Trial = true;
	Dynamsoft.WebTwainEnv.ProductKey = "t00901wAAAF+u0oFLI39wRNB580cu3kJSIZtbAcR5aCChp+BFa+RGTGv4L2zaA7Q4fzLjNbZJF55lzg9BdnPG5aZjeJPOJUTwD+r5izfQJtguoC4BNSFofgBZwyta";
	//Dynamsoft.WebTwainEnv.ProductKey = "A-Valid-Product-Key";
	//Dynamsoft.WebTwainEnv.ResourcesPath = "https://tst.dynamsoft.com/libs/dwt/15.0";

	Dynamsoft.WebTwainEnv.Load();
};

var DWObject, CurrentPath, strhttp, _strPort, uploadBeforeOCR = false, arySelectedAreas = [],
	_iLeft, _iTop, _iRight, _iBottom, bMultipage,
	CurrentPathName = unescape(location.pathname),
	CurrentPath = CurrentPathName.substring(0, CurrentPathName.lastIndexOf("/") + 1);

var
	EnumDWT_OCROutputFormat =
		{ OCROF_TEXT: 0, OCROF_PDFPLAINTEXT: 1, OCROF_PDFIMAGEOVERTEXT: 2, OCROF_PDFPLAINTEXT_PDFX: 3, OCROF_PDFIMAGEOVERTEXT_PDFX: 4 },
	OCRLanguages = [
		{ desc: "Arabic", val: "ara" },
		{ desc: "Bengali", val: "ben" },
		{ desc: "Chinese_Simplified", val: "chi_sim" },
		{ desc: "Chinese_Traditional", val: "chi_tra" },
		{ desc: "English", val: "eng" },
		{ desc: "French", val: "fra" },
		{ desc: "German", val: "deu" },
		{ desc: "Hindi", val: "hin" },
		{ desc: "Indonesian", val: "ind" },
		{ desc: "Italian", val: "ita" },
		{ desc: "Japanese", val: "jpn" },
		{ desc: "Javanese", val: "jav" },
		{ desc: "Korean", val: "kor" },
		{ desc: "Malay", val: "msa" },
		{ desc: "Marathi", val: "mar" },
		{ desc: "Panjabi", val: "pan" },
		{ desc: "Persian", val: "fas" },
		{ desc: "Portuguese", val: "por" },
		{ desc: "Russian", val: "rus" },
		{ desc: "Spanish", val: "spa" },
		{ desc: "Swahili", val: "swa" },
		{ desc: "Tamil", val: "tam" },
		{ desc: "Telugu", val: "tel" },
		{ desc: "Thai", val: "tha" },
		{ desc: "Turkish", val: "tur" },
		{ desc: "Vietnamese", val: "vie" },
		{ desc: "Urdu", val: "urd" }
	], OCROutputFormat = [
		{ desc: "String", val: EnumDWT_OCROutputFormat.OCROF_TEXT },
		{ desc: "TXT", val: EnumDWT_OCROutputFormat.OCROF_TEXT },
		{ desc: "Text PDF", val: EnumDWT_OCROutputFormat.OCROF_PDFPLAINTEXT },
		{ desc: "Image-over-text PDF", val: EnumDWT_OCROutputFormat.OCROF_PDFIMAGEOVERTEXT }
	], UploadFormat = [
		{ desc: "BMP", ext: ".bmp", val: EnumDWT_ImageType.IT_BMP },
		{ desc: "JPG", ext: ".jpg", val: EnumDWT_ImageType.IT_JPG },
		{ desc: "TIF", ext: ".tif", val: EnumDWT_ImageType.IT_TIF },
		{ desc: "PNG", ext: ".png", val: EnumDWT_ImageType.IT_PNG },
		{ desc: "PDF", ext: ".pdf", val: EnumDWT_ImageType.IT_PDF }
	];

function Dynamsoft_OnReady() {
	DWObject = Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer'); // Get the Dynamic Web TWAIN object that is embeded in the div with id 'dwtcontrolContainer'
	if (DWObject) {
		DWObject.Viewer.width = 504;
		DWObject.Viewer.height = 599;
		DWObject.Viewer.on("pageAreaSelected", Dynamsoft_OnImageAreaSelected);
		DWObject.Viewer.on("pageAreaUnselected", Dynamsoft_OnImageAreaDeselected);
		DWObject.RegisterEvent('OnGetFilePath', OCRALocalFile);
		_iLeft = 0;
		_iTop = 0;
		_iRight = 0;
		_iBottom = 0;
		strhttp = "http:";
		if ("https:" == document.location.protocol)
			strhttp = "https:";
		DWObject.IfSSL = Dynamsoft.Lib.detect.ssl;
		_strPort = location.port == "" ? 80 : location.port;
		if (Dynamsoft.Lib.detect.ssl == true)
			_strPort = location.port == "" ? 443 : location.port;
		DWObject.HTTPPort = _strPort;
		if (_strPort != "")
			_strPort = ':' + _strPort;
		for (var i = 0; i < OCRLanguages.length; i++)
			document.getElementById("ddlLanguages").options.add(new Option(OCRLanguages[i].desc, i));
		for (i = 0; i < OCROutputFormat.length; i++)
			document.getElementById("ddlOCROutputFormat").options.add(new Option(OCROutputFormat[i].desc, i));
		for (i = 0; i < UploadFormat.length; i++)
			document.getElementById("uploadFormat").options.add(new Option(UploadFormat[i].desc, i));
		document.getElementById("ddlLanguages").selectedIndex = 4;
		document.getElementById("uploadFormat").selectedIndex = 4;
		DWObject.Viewer.on("topPageChanged", Dynamsoft_OnTopImageInTheViewChanged);
		if (DWObject.Addon.PDF.IsModuleInstalled()) {
			/** PDFR already installed */
		}
	}
}


function Dynamsoft_OnImageAreaSelected(index, rect) {
	if (rect.length > 0) {
        var currentRect = rect[rect.length - 1];
		if (arySelectedAreas.length + 2 > rect.length)
			arySelectedAreas[rect.length - 1] = [index, currentRect.x, currentRect.y, currentRect.x + currentRect.width, currentRect.y + currentRect.heidht, rect.length];
		else
			arySelectedAreas.push(index, currentRect.x, currentRect.y, currentRect.x + currentRect.width, currentRect.y + currentRect.heidht, rect.length);
	}
}

function Dynamsoft_OnImageAreaDeselected(index) {
	arySelectedAreas = [];
}

function Dynamsoft_OnTopImageInTheViewChanged(index) {
	DWObject.CurrentImageIndexInBuffer = index;
}

function AcquireImage() {
	if (DWObject) {
		DWObject.SelectSource(function () {
			var OnAcquireImageSuccess, OnAcquireImageFailure;
			OnAcquireImageSuccess = OnAcquireImageFailure = function () {
				DWObject.CloseSource();
			};
			DWObject.OpenSource();
			DWObject.IfDisableSourceAfterAcquire = true;
			DWObject.AcquireImage(OnAcquireImageSuccess, OnAcquireImageFailure);
		}, function () {
			console.log('SelectSource failed!');
		});
	}
}

function LoadImages() {
	if (DWObject) {
		if (DWObject.Addon && DWObject.Addon.PDF) {
			DWObject.Addon.PDF.SetResolution(300);
			DWObject.Addon.PDF.SetConvertMode(EnumDWT_ConvertMode.CM_RENDERALL);
		}
		uploadBeforeOCR = false;
		DWObject.LoadImageEx('', 5,
			function () {
			},
			function (errorCode, errorString) {
				alert('Load Image:' + errorString);
			}
		);
	}
}


function OCRALocalFile(bSave, filesCount, index, path, filename) {
	var filePath = path + "\\" + filename;
	if (uploadBeforeOCR) {
		DWObject.HTTPUploadThroughPostDirectly(
			location.hostname,
			filePath,
			ocrActionOnServer,
			filename,
			function () { console.log('upload success with no returned info'); },
			OnOCRResultReturned
		);
	}
	uploadBeforeOCR = false;
}

function DoOCR(bLocalFile) {
	if (DWObject) {
		var aryToOCR = [];
		for (var i = 0; i < DWObject.HowManyImagesInBuffer; i++)
			aryToOCR.push(i);
		ocrActionOnServer = CurrentPath + "upload";
		var strhttp = "http:";
		if ("https:" == document.location.protocol)
			strhttp = "https:";
		DWObject.IfSSL = Dynamsoft.Lib.detect.ssl;
		var _strPort = location.port == "" ? 80 : location.port;
		if (Dynamsoft.Lib.detect.ssl == true)
			_strPort = location.port == "" ? 443 : location.port;
		DWObject.HTTPPort = _strPort;
		DWObject.ClearAllHTTPFormField();
		DWObject.SetHTTPFormField("ProductKey", DWObject.ProductKey);
		DWObject.SetHTTPFormField("OutputFormat", OCROutputFormat[document.getElementById("ddlOCROutputFormat").selectedIndex].val);
		DWObject.SetHTTPFormField("InputLanguage", OCRLanguages[document.getElementById("ddlLanguages").selectedIndex].val);
		if (bLocalFile) {
			uploadBeforeOCR = true;
			DWObject.ShowFileDialog(false, "BMP, JPG, TIF, PNG, PDF | *.bmp;*.jpg;*.tif;*.png;*pdf", 0, "", "", false, true, 0);
		} else {
			if (_strPort == 80)
				_strPort = '';
			else
				_strPort = ':' + _strPort;
			var imageType = UploadFormat[document.getElementById("uploadFormat").selectedIndex].val;
			switch (imageType) {
				case EnumDWT_ImageType.IT_BMP:
				case EnumDWT_ImageType.IT_JPG:
				case EnumDWT_ImageType.IT_PNG:
					aryToOCR = [DWObject.CurrentImageIndexInBuffer]; break;
				case EnumDWT_ImageType.IT_TIF:
				case EnumDWT_ImageType.IT_PDF: break;
			}
			var Digital = new Date(),
				uploadfilename = Digital.getMilliseconds() + UploadFormat[document.getElementById("uploadFormat").selectedIndex].ext;
			DWObject.HTTPUpload(
				strhttp + '//' + location.hostname + _strPort + ocrActionOnServer,
				aryToOCR,
				imageType,
				EnumDWT_UploadDataFormat.Binary,
				uploadfilename,
				function () { console.log('upload success with no returned info'); },
				OnOCRResultReturned
			);
		}
	}
}

function OnOCRResultReturned(errorCode, errorString, sHttpResponse) {
	var pos = sHttpResponse.indexOf("|#|");
	if (pos > -1) {
		var filename = sHttpResponse.substring(pos + 3);
		document.getElementById('divNoteMessage').innerHTML = [
			"<a href='",
			GetDownloadURL(filename),
			"' target='_blank'>",
			filename,
			"</a>"
		].join('');
	} else {
		var _resultToShow = [];
		if (sHttpResponse != "") {
			var _textResult = sHttpResponse.split(/\r?\n/g);
			for (var i = 0; i < _textResult.length; i++) {
				if (i == 0 && _textResult[i].trim() == "")
					continue;
				_resultToShow.push(_textResult[i] + '<br />');
			}
		}
		else
			_resultToShow.push(errorString + '<br />');
		_resultToShow.splice(0, 0, '<p style="padding:5px; margin:0;">');
		_resultToShow.push('</p>');
		document.getElementById('divNoteMessage').innerHTML = _resultToShow.join('');
	}
}

function GetDownloadURL(outPutFile) {
	var _strPort = location.port == "" ? 80 : location.port;
	if (Dynamsoft.Lib.detect.ssl == true) {
		_strPort = location.port == "" ? 443 : location.port;
		downloadURLTemp = "https://";
	}
	else
		downloadURLTemp = "http://";

	var strDownloadPage = CurrentPath + "uploadTemp/" + outPutFile;

	downloadURLTemp = downloadURLTemp + location.hostname + ":" + _strPort + strDownloadPage;

	return downloadURLTemp;
}

function RemoveSelected() {
	if (DWObject) {
		DWObject.RemoveAllSelectedImages();
	}
}