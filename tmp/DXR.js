var ASPx = {};
(function () {
  ASPx.EmptyObject = {};
  ASPx.FalseFunction = function () {
    return false;
  };
  ASPx.SSLSecureBlankUrl = "/DXR.axd?r=1_0-UPGKh";
  ASPx.EmptyImageUrl = "/DXR.axd?r=1_37-UPGKh";
  ASPx.VersionInfo =
    "Version='15.2.9.0', File Version='15.2.9.0', Date Modified='9. 11. 2018 15:14:26'";
  ASPx.InvalidDimension = -10000;
  ASPx.InvalidPosition = -10000;
  ASPx.AbsoluteLeftPosition = -10000;
  ASPx.EmptyGuid = "00000000-0000-0000-0000-000000000000";
  ASPx.CallbackSeparator = ":";
  ASPx.ItemIndexSeparator = "i";
  ASPx.CallbackResultPrefix = "/*DX*/";
  ASPx.AccessibilityEmptyUrl = "javascript:;";
  ASPx.PossibleNumberDecimalSeparators = [",", "."];
  ASPx.CultureInfo = {
    twoDigitYearMax: 2029,
    ts: ":",
    ds: "/",
    am: "AM",
    pm: "PM",
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
      "",
    ],
    genMonthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
      "",
    ],
    abbrMonthNames: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "",
    ],
    abbrDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNames: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    numDecimalPoint: ".",
    numPrec: 2,
    numGroupSeparator: ",",
    numGroups: [3],
    numNegPattern: 1,
    numPosInf: "Infinity",
    numNegInf: "-Infinity",
    numNan: "NaN",
    currency: "$",
    currDecimalPoint: ".",
    currPrec: 2,
    currGroupSeparator: ",",
    currGroups: [3],
    currPosPattern: 0,
    currNegPattern: 0,
    percentPattern: 0,
    shortTime: "h:mm tt",
    longTime: "h:mm:ss tt",
    shortDate: "M/d/yyyy",
    longDate: "dddd, MMMM d, yyyy",
    monthDay: "MMMM d",
    yearMonth: "MMMM yyyy",
  };
  ASPx.CultureInfo.genMonthNames = ASPx.CultureInfo.monthNames;
  ASPx.Position = {
    Left: "Left",
    Right: "Right",
    Top: "Top",
    Bottom: "Bottom",
  };
  var DateUtils = {};
  DateUtils.GetInvariantDateString = function (date) {
    if (!date) return "01/01/0001";
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var result = "";
    if (month < 10) result += "0";
    result += month.toString() + "/";
    if (day < 10) result += "0";
    result += day.toString() + "/";
    if (year < 1000) result += "0";
    result += year.toString();
    return result;
  };
  DateUtils.GetInvariantDateTimeString = function (date) {
    var dateTimeString = DateUtils.GetInvariantDateString(date);
    var time = {
      h: date.getHours(),
      m: date.getMinutes(),
      s: date.getSeconds(),
    };
    for (var key in time) {
      var str = time[key].toString();
      if (str.length < 2) str = "0" + str;
      time[key] = str;
    }
    dateTimeString += " " + time.h + ":" + time.m + ":" + time.s;
    var msec = date.getMilliseconds();
    if (msec > 0) dateTimeString += "." + msec.toString();
    return dateTimeString;
  };
  DateUtils.ExpandTwoDigitYear = function (value) {
    value += 1900;
    if (value + 99 < ASPx.CultureInfo.twoDigitYearMax) value += 100;
    return value;
  };
  DateUtils.ToUtcTime = function (date) {
    var result = new Date();
    result.setTime(date.valueOf() + 60000 * date.getTimezoneOffset());
    return result;
  };
  DateUtils.ToLocalTime = function (date) {
    var result = new Date();
    result.setTime(date.valueOf() - 60000 * date.getTimezoneOffset());
    return result;
  };
  DateUtils.AreDatesEqualExact = function (date1, date2) {
    if (date1 == null && date2 == null) return true;
    if (date1 == null || date2 == null) return false;
    return date1.getTime() == date2.getTime();
  };
  DateUtils.FixTimezoneGap = function (oldDate, newDate) {
    var diff = newDate.getHours() - oldDate.getHours();
    if (diff == 0) return;
    var sign = diff == 1 || diff == -23 ? -1 : 1;
    var trial = new Date(newDate.getTime() + sign * 3600000);
    if (sign > 0 || trial.getDate() == newDate.getDate())
      newDate.setTime(trial.getTime());
  };
  ASPx.DateUtils = DateUtils;
  var Timer = {};
  Timer.ClearTimer = function (timerID) {
    if (timerID > -1) window.clearTimeout(timerID);
    return -1;
  };
  Timer.ClearInterval = function (timerID) {
    if (timerID > -1) window.clearInterval(timerID);
    return -1;
  };
  var setControlBoundTimer = function (
    handler,
    control,
    setTimerFunction,
    clearTimerFunction,
    delay
  ) {
    var timerId;
    var getTimerId = function () {
      return timerId;
    };
    var boundHandler = function () {
      var controlExists =
        control && ASPx.GetControlCollection().Get(control.name) === control;
      if (controlExists) handler.aspxBind(control)();
      else clearTimerFunction(getTimerId());
    };
    timerId = setTimerFunction(boundHandler, delay);
    return timerId;
  };
  Timer.SetControlBoundTimeout = function (handler, control, delay) {
    return setControlBoundTimer(
      handler,
      control,
      window.setTimeout,
      Timer.ClearTimer,
      delay
    );
  };
  Timer.SetControlBoundInterval = function (handler, control, delay) {
    return setControlBoundTimer(
      handler,
      control,
      window.setInterval,
      Timer.ClearInterval,
      delay
    );
  };
  ASPx.Timer = Timer;
  var Browser = {};
  Browser.UserAgent = navigator.userAgent.toLowerCase();
  Browser.Mozilla = false;
  Browser.IE = false;
  Browser.Firefox = false;
  Browser.Netscape = false;
  Browser.Safari = false;
  Browser.Chrome = false;
  Browser.Opera = false;
  Browser.Edge = false;
  Browser.Version = undefined;
  Browser.MajorVersion = undefined;
  Browser.WindowsPlatform = false;
  Browser.MacOSPlatform = false;
  Browser.MacOSMobilePlatform = false;
  Browser.AndroidMobilePlatform = false;
  Browser.PlaformMajorVersion = false;
  Browser.WindowsPhonePlatform = false;
  Browser.AndroidDefaultBrowser = false;
  Browser.AndroidChromeBrowser = false;
  Browser.SamsungAndroidDevice = false;
  Browser.WebKitTouchUI = false;
  Browser.MSTouchUI = false;
  Browser.TouchUI = false;
  Browser.WebKitFamily = false;
  Browser.NetscapeFamily = false;
  Browser.HardwareAcceleration = false;
  Browser.VirtualKeyboardSupported = false;
  Browser.Info = "";
  function indentPlatformMajorVersion(userAgent) {
    var regex =
      /(?:(?:windows nt|macintosh|mac os|cpu os|cpu iphone os|android|windows phone|linux) )(\d+)(?:[-0-9_.])*/;
    var matches = regex.exec(userAgent);
    if (matches) Browser.PlaformMajorVersion = matches[1];
  }
  function getIECompatibleVersionString() {
    if (document.compatible) {
      for (var i = 0; i < document.compatible.length; i++)
        if (
          document.compatible[i].userAgent === "IE" &&
          document.compatible[i].version
        )
          return document.compatible[i].version.toLowerCase();
    }
    return "";
  }
  Browser.IdentUserAgent = function (userAgent, ignoreDocumentMode) {
    var browserTypesOrderedList = [
      "Mozilla",
      "IE",
      "Firefox",
      "Netscape",
      "Safari",
      "Chrome",
      "Opera",
      "Opera10",
      "Edge",
    ];
    var defaultBrowserType = "IE";
    var defaultPlatform = "Win";
    var defaultVersions = {
      Safari: 2,
      Chrome: 0.1,
      Mozilla: 1.9,
      Netscape: 8,
      Firefox: 2,
      Opera: 9,
      IE: 6,
      Edge: 12,
    };
    if (!userAgent || userAgent.length == 0) {
      fillUserAgentInfo(
        browserTypesOrderedList,
        defaultBrowserType,
        defaultVersions[defaultBrowserType],
        defaultPlatform
      );
      return;
    }
    userAgent = userAgent.toLowerCase();
    indentPlatformMajorVersion(userAgent);
    try {
      var platformIdentStrings = {
        Windows: "Win",
        Macintosh: "Mac",
        "Mac OS": "Mac",
        Mac_PowerPC: "Mac",
        "cpu os": "MacMobile",
        "cpu iphone os": "MacMobile",
        Android: "Android",
        "!Windows Phone": "WinPhone",
        "!WPDesktop": "WinPhone",
        "!ZuneWP": "WinPhone",
      };
      var optSlashOrSpace = "(?:/|\\s*)?";
      var version = "(\\d+)(?:\\.((?:\\d+?[1-9])|\\d)0*?)?";
      var optVersion = "(?:" + version + ")?";
      var patterns = {
        Safari:
          "applewebkit(?:.*?(?:version/" +
          version +
          "[\\.\\w\\d]*?(?:\\s+mobile/\\S*)?\\s+safari))?",
        Chrome: "(?:chrome|crios)(?!frame)" + optSlashOrSpace + optVersion,
        Mozilla: "mozilla(?:.*rv:" + optVersion + ".*Gecko)?",
        Netscape: "(?:netscape|navigator)\\d*/?\\s*" + optVersion,
        Firefox: "firefox" + optSlashOrSpace + optVersion,
        Opera: "opera" + optSlashOrSpace + optVersion,
        Opera10: "opera.*\\s*version" + optSlashOrSpace + optVersion,
        IE: "msie\\s*" + optVersion,
        Edge: "edge" + optSlashOrSpace + optVersion,
      };
      var browserType;
      var version = -1;
      for (var i = 0; i < browserTypesOrderedList.length; i++) {
        var browserTypeCandidate = browserTypesOrderedList[i];
        var regExp = new RegExp(patterns[browserTypeCandidate], "i");
        if (regExp.compile) regExp.compile(patterns[browserTypeCandidate], "i");
        var matches = regExp.exec(userAgent);
        if (matches && matches.index >= 0) {
          if (
            browserType == "IE" &&
            version >= 11 &&
            browserTypeCandidate == "Safari"
          )
            continue;
          browserType = browserTypeCandidate;
          if (browserType == "Opera10") browserType = "Opera";
          var tridentPattern = "trident" + optSlashOrSpace + optVersion;
          version = Browser.GetBrowserVersion(
            userAgent,
            matches,
            tridentPattern,
            getIECompatibleVersionString()
          );
          if (browserType == "Mozilla" && version >= 11) browserType = "IE";
        }
      }
      if (!browserType) browserType = defaultBrowserType;
      var browserVersionDetected = version != -1;
      if (!browserVersionDetected) version = defaultVersions[browserType];
      var platform;
      var minOccurenceIndex = Number.MAX_VALUE;
      for (var identStr in platformIdentStrings) {
        if (!platformIdentStrings.hasOwnProperty(identStr)) continue;
        var importantIdent = identStr.substr(0, 1) == "!";
        var occurenceIndex = userAgent.indexOf(
          (importantIdent ? identStr.substr(1) : identStr).toLowerCase()
        );
        if (
          occurenceIndex >= 0 &&
          (occurenceIndex < minOccurenceIndex || importantIdent)
        ) {
          minOccurenceIndex = importantIdent ? 0 : occurenceIndex;
          platform = platformIdentStrings[identStr];
        }
      }
      var samsungPattern = "SM-[A-Z]";
      var matches = userAgent.toUpperCase().match(samsungPattern);
      var isSamsungAndroidDevice = matches && matches.length > 0;
      if (platform == "WinPhone" && version < 9)
        version = Math.floor(
          getVersionFromTrident(
            userAgent,
            "trident" + optSlashOrSpace + optVersion
          )
        );
      if (
        !ignoreDocumentMode &&
        browserType == "IE" &&
        version > 7 &&
        document.documentMode < version
      )
        version = document.documentMode;
      if (platform == "WinPhone") version = Math.max(9, version);
      if (!platform) platform = defaultPlatform;
      if (platform == platformIdentStrings["cpu os"] && !browserVersionDetected)
        version = 4;
      fillUserAgentInfo(
        browserTypesOrderedList,
        browserType,
        version,
        platform,
        isSamsungAndroidDevice
      );
    } catch (e) {
      fillUserAgentInfo(
        browserTypesOrderedList,
        defaultBrowserType,
        defaultVersions[defaultBrowserType],
        defaultPlatform
      );
    }
  };
  function getVersionFromMatches(matches) {
    var result = -1;
    var versionStr = "";
    if (matches[1]) {
      versionStr += matches[1];
      if (matches[2]) versionStr += "." + matches[2];
    }
    if (versionStr != "") {
      result = parseFloat(versionStr);
      if (result == NaN) result = -1;
    }
    return result;
  }
  function getVersionFromTrident(userAgent, tridentPattern) {
    var tridentDiffFromVersion = 4;
    var matches = new RegExp(tridentPattern, "i").exec(userAgent);
    return getVersionFromMatches(matches) + tridentDiffFromVersion;
  }
  Browser.GetBrowserVersion = function (
    userAgent,
    matches,
    tridentPattern,
    ieCompatibleVersionString
  ) {
    var version = getVersionFromMatches(matches);
    if (ieCompatibleVersionString) {
      var versionFromTrident = getVersionFromTrident(userAgent, tridentPattern);
      if (
        ieCompatibleVersionString === "edge" ||
        parseInt(ieCompatibleVersionString) === versionFromTrident
      )
        return versionFromTrident;
    }
    return version;
  };
  function fillUserAgentInfo(
    browserTypesOrderedList,
    browserType,
    version,
    platform,
    isSamsungAndroidDevice
  ) {
    for (var i = 0; i < browserTypesOrderedList.length; i++) {
      var type = browserTypesOrderedList[i];
      Browser[type] = type == browserType;
    }
    Browser.Version = Math.floor(10.0 * version) / 10.0;
    Browser.MajorVersion = Math.floor(Browser.Version);
    Browser.WindowsPlatform = platform == "Win" || platform == "WinPhone";
    Browser.MacOSPlatform = platform == "Mac";
    Browser.MacOSMobilePlatform = platform == "MacMobile";
    Browser.AndroidMobilePlatform = platform == "Android";
    Browser.WindowsPhonePlatform = platform == "WinPhone";
    Browser.WebKitFamily = Browser.Safari || Browser.Chrome;
    Browser.NetscapeFamily =
      Browser.Netscape || Browser.Mozilla || Browser.Firefox;
    Browser.HardwareAcceleration =
      (Browser.IE && Browser.MajorVersion >= 9) ||
      (Browser.Firefox && Browser.MajorVersion >= 4) ||
      (Browser.AndroidMobilePlatform && Browser.Chrome) ||
      (Browser.Chrome && Browser.MajorVersion >= 37) ||
      (Browser.Safari && !Browser.WindowsPlatform) ||
      Browser.Edge;
    Browser.WebKitTouchUI =
      Browser.MacOSMobilePlatform || Browser.AndroidMobilePlatform;
    var isIETouchUI =
      Browser.IE &&
      Browser.MajorVersion > 9 &&
      Browser.WindowsPlatform &&
      Browser.UserAgent.toLowerCase().indexOf("touch") >= 0;
    Browser.MSTouchUI =
      isIETouchUI || (Browser.Edge && !!window.navigator.maxTouchPoints);
    Browser.TouchUI = Browser.WebKitTouchUI || Browser.MSTouchUI;
    Browser.MobileUI = Browser.WebKitTouchUI || Browser.WindowsPhonePlatform;
    Browser.AndroidDefaultBrowser =
      Browser.AndroidMobilePlatform && !Browser.Chrome;
    Browser.AndroidChromeBrowser =
      Browser.AndroidMobilePlatform && Browser.Chrome;
    if (isSamsungAndroidDevice)
      Browser.SamsungAndroidDevice = isSamsungAndroidDevice;
    if (Browser.MSTouchUI) {
      var isARMArchitecture =
        Browser.UserAgent.toLowerCase().indexOf("arm;") > -1;
      Browser.VirtualKeyboardSupported =
        isARMArchitecture || Browser.WindowsPhonePlatform;
    } else {
      Browser.VirtualKeyboardSupported = Browser.WebKitTouchUI;
    }
    fillDocumentElementBrowserTypeClassNames(browserTypesOrderedList);
  }
  function fillDocumentElementBrowserTypeClassNames(browserTypesOrderedList) {
    var documentElementClassName = "";
    var browserTypeslist = browserTypesOrderedList.concat([
      "WindowsPlatform",
      "MacOSPlatform",
      "MacOSMobilePlatform",
      "AndroidMobilePlatform",
      "WindowsPhonePlatform",
      "WebKitFamily",
      "WebKitTouchUI",
      "MSTouchUI",
      "TouchUI",
      "AndroidDefaultBrowser",
    ]);
    for (var i = 0; i < browserTypeslist.length; i++) {
      var type = browserTypeslist[i];
      if (Browser[type]) documentElementClassName += "dx" + type + " ";
    }
    documentElementClassName += "dxBrowserVersion-" + Browser.MajorVersion;
    if (document && document.documentElement) {
      if (document.documentElement.className != "")
        documentElementClassName = " " + documentElementClassName;
      document.documentElement.className += documentElementClassName;
      Browser.Info = documentElementClassName;
    }
  }
  Browser.IdentUserAgent(Browser.UserAgent);
  ASPx.Browser = Browser;
  ASPx.BlankUrl = Browser.IE
    ? ASPx.SSLSecureBlankUrl
    : Browser.Opera
    ? "about:blank"
    : "";
  var Data = {};
  Data.ArrayInsert = function (array, element, position) {
    if (0 <= position && position < array.length) {
      for (var i = array.length; i > position; i--) array[i] = array[i - 1];
      array[position] = element;
    } else array.push(element);
  };
  Data.ArrayRemove = function (array, element) {
    var index = Data.ArrayIndexOf(array, element);
    if (index > -1) Data.ArrayRemoveAt(array, index);
  };
  Data.ArrayRemoveAt = function (array, index) {
    if (index >= 0 && index < array.length) {
      for (var i = index; i < array.length - 1; i++) array[i] = array[i + 1];
      array.pop();
    }
  };
  Data.ArrayClear = function (array) {
    while (array.length > 0) array.pop();
  };
  Data.ArrayIndexOf = function (array, element, comparer) {
    if (!comparer) {
      for (var i = 0; i < array.length; i++) {
        if (array[i] == element) return i;
      }
    } else {
      for (var i = 0; i < array.length; i++) {
        if (comparer(array[i], element)) return i;
      }
    }
    return -1;
  };
  Data.ArrayContains = function (array, element) {
    return Data.ArrayIndexOf(array, element) >= 0;
  };
  Data.ArrayEqual = function (array1, array2) {
    var count1 = array1.length;
    var count2 = array2.length;
    if (count1 != count2) return false;
    for (var i = 0; i < count1; i++) if (array1[i] != array2[i]) return false;
    return true;
  };
  Data.ArrayGetIntegerEdgeValues = function (array) {
    var arrayToSort = Data.CollectionToArray(array);
    Data.ArrayIntegerAscendingSort(arrayToSort);
    return {
      start: arrayToSort[0],
      end: arrayToSort[arrayToSort.length - 1],
    };
  };
  Data.ArrayIntegerAscendingSort = function (array) {
    Data.ArrayIntegerSort(array);
  };
  Data.ArrayIntegerSort = function (array, desc) {
    array.sort(function (i1, i2) {
      var res = 0;
      if (i1 > i2) res = 1;
      else if (i1 < i2) res = -1;
      if (desc) res *= -1;
      return res;
    });
  };
  Data.CollectionsUnionToArray = function (firstCollection, secondCollection) {
    var result = [];
    var firstCollectionLength = firstCollection.length;
    var secondCollectionLength = secondCollection.length;
    for (var i = 0; i < firstCollectionLength + secondCollectionLength; i++) {
      if (i < firstCollectionLength) result.push(firstCollection[i]);
      else result.push(secondCollection[i - firstCollectionLength]);
    }
    return result;
  };
  Data.CollectionToArray = function (collection) {
    var array = [];
    for (var i = 0; i < collection.length; i++) array.push(collection[i]);
    return array;
  };
  Data.CreateHashTableFromArray = function (array) {
    var hash = [];
    for (var i = 0; i < array.length; i++) hash[array[i]] = 1;
    return hash;
  };
  Data.CreateIndexHashTableFromArray = function (array) {
    var hash = [];
    for (var i = 0; i < array.length; i++) hash[array[i]] = i;
    return hash;
  };
  var defaultBinarySearchComparer = function (array, index, value) {
    var arrayElement = array[index];
    if (arrayElement == value) return 0;
    else return arrayElement < value ? -1 : 1;
  };
  Data.NearestLeftBinarySearchComparer = function (array, index, value) {
    var arrayElement = array[index];
    var leftPoint = arrayElement < value;
    var lastLeftPoint = leftPoint && index == array.length - 1;
    var nearestLeftPoint =
      lastLeftPoint || (leftPoint && array[index + 1] >= value);
    if (nearestLeftPoint) return 0;
    else return arrayElement < value ? -1 : 1;
  };
  Data.ArrayBinarySearch = function (
    array,
    value,
    binarySearchComparer,
    startIndex,
    length
  ) {
    if (!binarySearchComparer)
      binarySearchComparer = defaultBinarySearchComparer;
    if (!ASPx.IsExists(startIndex)) startIndex = 0;
    if (!ASPx.IsExists(length)) length = array.length - startIndex;
    var endIndex = startIndex + length - 1;
    while (startIndex <= endIndex) {
      var middle = startIndex + ((endIndex - startIndex) >> 1);
      var compareResult = binarySearchComparer(array, middle, value);
      if (compareResult == 0) return middle;
      if (compareResult < 0) startIndex = middle + 1;
      else endIndex = middle - 1;
    }
    return -(startIndex + 1);
  };
  Data.GetDistinctArray = function (array) {
    var resultArray = [];
    for (var i = 0; i < array.length; i++) {
      var currentEntry = array[i];
      if (Data.ArrayIndexOf(resultArray, currentEntry) == -1) {
        resultArray.push(currentEntry);
      }
    }
    return resultArray;
  };
  Data.ForEach = function (arr, callback) {
    if (Array.prototype.forEach) {
      Array.prototype.forEach.call(arr, callback);
    } else {
      for (var i = 0, len = arr.length; i < len; i++) {
        callback(arr[i], i, arr);
      }
    }
  };
  ASPx.Data = Data;
  var Cookie = {};
  Cookie.DelCookie = function (name) {
    setCookieInternal(name, "", new Date(1970, 1, 1));
  };
  Cookie.GetCookie = function (name) {
    name = escape(name);
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var cookie = Str.Trim(cookies[i]);
      if (cookie.indexOf(name + "=") == 0)
        return unescape(cookie.substring(name.length + 1, cookie.length));
      else if (cookie.indexOf(name + ";") == 0 || cookie === name) return "";
    }
    return null;
  };
  Cookie.SetCookie = function (name, value, expirationDate) {
    if (!ASPx.IsExists(value)) {
      Cookie.DelCookie(name);
      return;
    }
    if (!ASPx.Ident.IsDate(expirationDate)) {
      expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    }
    setCookieInternal(name, value, expirationDate);
  };
  function setCookieInternal(name, value, date) {
    document.cookie =
      escape(name) +
      "=" +
      escape(value.toString()) +
      "; expires=" +
      date.toGMTString() +
      "; path=/";
  }
  ASPx.Cookie = Cookie;
  ASPx.ImageUtils = {
    GetImageSrc: function (image) {
      return image.src;
    },
    SetImageSrc: function (image, src) {
      image.src = src;
    },
    SetSize: function (image, width, height) {
      image.style.width = width + "px";
      image.style.height = height + "px";
    },
    GetSize: function (image, isWidth) {
      return isWidth ? image.offsetWidth : image.offsetHeight;
    },
  };
  var Str = {};
  Str.ApplyReplacement = function (text, replecementTable) {
    if (typeof text != "string") text = text.toString();
    for (var i = 0; i < replecementTable.length; i++) {
      var replacement = replecementTable[i];
      text = text.replace(replacement[0], replacement[1]);
    }
    return text;
  };
  Str.CompleteReplace = function (text, regexp, newSubStr) {
    if (typeof text != "string") text = text.toString();
    var textPrev;
    do {
      textPrev = text;
      text = text.replace(regexp, newSubStr);
    } while (text != textPrev);
    return text;
  };
  Str.EncodeHtml = function (html) {
    return Str.ApplyReplacement(html, [
      [/&amp;/g, "&ampx;"],
      [/&/g, "&amp;"],
      [/&quot;/g, "&quotx;"],
      [/"/g, "&quot;"],
      [/&lt;/g, "&ltx;"],
      [/</g, "&lt;"],
      [/&gt;/g, "&gtx;"],
      [/>/g, "&gt;"],
    ]);
  };
  Str.DecodeHtml = function (html) {
    return Str.ApplyReplacement(html, [
      [/&gt;/g, ">"],
      [/&gtx;/g, "&gt;"],
      [/&lt;/g, "<"],
      [/&ltx;/g, "&lt;"],
      [/&quot;/g, '"'],
      [/&quotx;/g, "&quot;"],
      [/&amp;/g, "&"],
      [/&ampx;/g, "&amp;"],
    ]);
  };
  Str.TrimStart = function (str) {
    return trimInternal(str, true);
  };
  Str.TrimEnd = function (str) {
    return trimInternal(str, false, true);
  };
  Str.Trim = function (str) {
    return trimInternal(str, true, true);
  };
  var whiteSpaces = {
    0x0009: 1,
    0x000a: 1,
    0x000b: 1,
    0x000c: 1,
    0x000d: 1,
    0x0020: 1,
    0x0085: 1,
    0x00a0: 1,
    0x1680: 1,
    0x180e: 1,
    0x2000: 1,
    0x2001: 1,
    0x2002: 1,
    0x2003: 1,
    0x2004: 1,
    0x2005: 1,
    0x2006: 1,
    0x2007: 1,
    0x2008: 1,
    0x2009: 1,
    0x200a: 1,
    0x200b: 1,
    0x2028: 1,
    0x2029: 1,
    0x202f: 1,
    0x205f: 1,
    0x3000: 1,
  };
  var caretWidth = 1;
  function trimInternal(source, trimStart, trimEnd) {
    var len = source.length;
    if (!len) return source;
    if (len < 0xbaba1) {
      var result = source;
      if (trimStart) {
        result = result.replace(/^\s+/, "");
      }
      if (trimEnd) {
        result = result.replace(/\s+$/, "");
      }
      return result;
    } else {
      var start = 0;
      if (trimEnd) {
        while (len > 0 && whiteSpaces[source.charCodeAt(len - 1)]) {
          len--;
        }
      }
      if (trimStart && len > 0) {
        while (start < len && whiteSpaces[source.charCodeAt(start)]) {
          start++;
        }
      }
      return source.substring(start, len);
    }
  }
  Str.Insert = function (str, subStr, index) {
    var leftText = str.slice(0, index);
    var rightText = str.slice(index);
    return leftText + subStr + rightText;
  };
  Str.InsertEx = function (str, subStr, startIndex, endIndex) {
    var leftText = str.slice(0, startIndex);
    var rightText = str.slice(endIndex);
    return leftText + subStr + rightText;
  };
  var greekSLFSigmaChar = String.fromCharCode(962);
  var greekSLSigmaChar = String.fromCharCode(963);
  Str.PrepareStringForFilter = function (s) {
    s = s.toLowerCase();
    if (ASPx.Browser.WebKitFamily) {
      return s.replace(new RegExp(greekSLFSigmaChar, "g"), greekSLSigmaChar);
    }
    return s;
  };
  Str.GetCoincideCharCount = function (text, filter, textMatchingDelegate) {
    var coincideText = ASPx.Str.PrepareStringForFilter(filter);
    var originText = ASPx.Str.PrepareStringForFilter(text);
    while (
      coincideText != "" &&
      !textMatchingDelegate(originText, coincideText)
    ) {
      coincideText = coincideText.slice(0, -1);
    }
    return coincideText.length;
  };
  ASPx.Str = Str;
  var Xml = {};
  Xml.Parse = function (xmlStr) {
    if (window.DOMParser) {
      var parser = new DOMParser();
      return parser.parseFromString(xmlStr, "text/xml");
    } else if (window.ActiveXObject) {
      var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
      if (xmlDoc) {
        xmlDoc.async = false;
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
      }
    }
    return null;
  };
  ASPx.Xml = Xml;
  ASPx.Key = {
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    Ctrl: 17,
    Shift: 16,
    Alt: 18,
    Enter: 13,
    Home: 36,
    End: 35,
    Left: 37,
    Right: 39,
    Up: 38,
    Down: 40,
    PageUp: 33,
    PageDown: 34,
    Esc: 27,
    Space: 32,
    Tab: 9,
    Backspace: 8,
    Delete: 46,
    Insert: 45,
    ContextMenu: 93,
    Windows: 91,
    Decimal: 110,
  };
  ASPx.ScrollBarMode = { Hidden: 0, Visible: 1, Auto: 2 };
  ASPx.ColumnResizeMode = { None: 0, Control: 1, NextColumn: 2 };
  var Selection = {};
  Selection.Set = function (input, startPos, endPos, scrollToSelection) {
    if (!ASPx.IsExistsElement(input)) return;
    if (
      Browser.VirtualKeyboardSupported &&
      (ASPx.GetActiveElement() !== input ||
        ASPx.VirtualKeyboardUI.getInputNativeFocusLocked())
    )
      return;
    var textLen = input.value.length;
    startPos = ASPx.GetDefinedValue(startPos, 0);
    endPos = ASPx.GetDefinedValue(endPos, textLen);
    if (startPos < 0) startPos = 0;
    if (endPos < 0 || endPos > textLen) endPos = textLen;
    if (startPos > endPos) startPos = endPos;
    var makeReadOnly = false;
    if (Browser.WebKitFamily && input.readOnly) {
      input.readOnly = false;
      makeReadOnly = true;
    }
    try {
      if (Browser.Firefox && Browser.Version >= 8)
        input.setSelectionRange(startPos, endPos, "backward");
      else if (Browser.IE && input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveStart("character", startPos);
        range.moveEnd("character", endPos - startPos);
        range.select();
      } else {
        forceScrollToSelectionRange(input, startPos, endPos);
        input.setSelectionRange(startPos, endPos);
      }
      if (Browser.Opera || Browser.Firefox || Browser.Chrome) input.focus();
    } catch (e) {}
    if (scrollToSelection && input.tagName == "TEXTAREA") {
      var scrollHeight = input.scrollHeight;
      var approxCaretPos = startPos;
      var scrollTop = Math.max(
        Math.round(
          (approxCaretPos * scrollHeight) / textLen - input.clientHeight / 2
        ),
        0
      );
      input.scrollTop = scrollTop;
    }
    if (makeReadOnly) input.readOnly = true;
  };
  var getTextWidthBeforePos = function (input, pos) {
    return ASPx.GetSizeOfText(
      input.value.toString().substr(0, pos),
      ASPx.GetCurrentStyle(input)
    ).width;
  };
  var forceScrollToSelectionRange = function (input, startPos, endPos) {
    var widthBeforeStartPos =
      getTextWidthBeforePos(input, startPos) - caretWidth;
    var widthBeforeEndPos = getTextWidthBeforePos(input, endPos) + caretWidth;
    var inputRawWidth =
      input.offsetWidth -
      ASPx.GetLeftRightBordersAndPaddingsSummaryValue(input);
    if (input.scrollLeft < widthBeforeEndPos - inputRawWidth)
      input.scrollLeft = widthBeforeEndPos - inputRawWidth;
    else if (input.scrollLeft > widthBeforeStartPos)
      input.scrollLeft = widthBeforeStartPos;
  };
  Selection.GetInfo = function (input) {
    var start, end;
    if (Browser.IE && Browser.Version < 9) {
      var range = document.selection.createRange();
      var rangeCopy = range.duplicate();
      range.move("character", -input.value.length);
      range.setEndPoint("EndToStart", rangeCopy);
      start = range.text.length;
      end = start + rangeCopy.text.length;
    } else {
      try {
        start = input.selectionStart;
        end = input.selectionEnd;
      } catch (e) {}
    }
    return { startPos: start, endPos: end };
  };
  Selection.GetExtInfo = function (input) {
    var start = 0,
      end = 0,
      textLen = 0;
    if (Browser.IE && Browser.Version < 9) {
      var normalizedValue;
      var range, textInputRange, textInputEndRange;
      range = document.selection.createRange();
      if (range && range.parentElement() == input) {
        textLen = input.value.length;
        normalizedValue = input.value.replace(/\r\n/g, "\n");
        textInputRange = input.createTextRange();
        textInputRange.moveToBookmark(range.getBookmark());
        textInputEndRange = input.createTextRange();
        textInputEndRange.collapse(false);
        if (
          textInputRange.compareEndPoints("StartToEnd", textInputEndRange) > -1
        ) {
          start = textLen;
          end = textLen;
        } else {
          start =
            normalizedValue.slice(0, start).split("\n").length -
            textInputRange.moveStart("character", -textLen) -
            1;
          if (
            textInputRange.compareEndPoints("EndToEnd", textInputEndRange) > -1
          )
            end = textLen;
          else
            end =
              normalizedValue.slice(0, end).split("\n").length -
              textInputRange.moveEnd("character", -textLen) -
              1;
        }
      }
      return { startPos: start, endPos: end };
    }
    try {
      start = input.selectionStart;
      end = input.selectionEnd;
    } catch (e) {}
    return { startPos: start, endPos: end };
  };
  Selection.SetCaretPosition = function (input, caretPos) {
    if (typeof caretPos === "undefined" || caretPos < 0)
      caretPos = input.value.length;
    Selection.Set(input, caretPos, caretPos, true);
  };
  Selection.GetCaretPosition = function (element, isDialogMode) {
    var pos = 0;
    if ("selectionStart" in element) {
      pos = element.selectionStart;
    } else if ("selection" in document) {
      element.focus();
      var sel = document.selection.createRange(),
        selLength = document.selection.createRange().text.length;
      sel.moveStart("character", -element.value.length);
      pos = sel.text.length - selLength;
    }
    if (isDialogMode && !pos) {
      pos = element.value.length - 1;
    }
    return pos;
  };
  Selection.Clear = function () {
    try {
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      } else if (document.selection) {
        if (document.selection.empty) document.selection.empty();
        else if (document.selection.clear) document.selection.clear();
      }
    } catch (e) {}
  };
  Selection.ClearOnMouseMove = function (evt) {
    if (!Browser.IE || evt.button != 0) Selection.Clear();
  };
  Selection.SetElementSelectionEnabled = function (element, value) {
    var userSelectValue = value ? "" : "none";
    var func = value ? Evt.DetachEventFromElement : Evt.AttachEventToElement;
    if (Browser.Firefox) element.style.MozUserSelect = userSelectValue;
    else if (Browser.WebKitFamily)
      element.style.webkitUserSelect = userSelectValue;
    else if (Browser.Opera) func(element, "mousemove", Selection.Clear);
    else {
      func(element, "selectstart", ASPx.FalseFunction);
      func(element, "mousemove", Selection.Clear);
    }
  };
  Selection.SetElementAsUnselectable = function (
    element,
    isWithChild,
    recursive
  ) {
    if (element && element.nodeType == 1) {
      element.unselectable = "on";
      if (Browser.NetscapeFamily) element.onmousedown = ASPx.FalseFunction;
      if ((Browser.IE && Browser.Version >= 9) || Browser.WebKitFamily)
        Evt.AttachEventToElement(
          element,
          "mousedown",
          Evt.PreventEventAndBubble
        );
      if (isWithChild === true) {
        for (var j = 0; j < element.childNodes.length; j++)
          Selection.SetElementAsUnselectable(
            element.childNodes[j],
            !!recursive ? true : false,
            !!recursive
          );
      }
    }
  };
  ASPx.Selection = Selection;
  var MouseScroller = {};
  MouseScroller.MinimumOffset = 10;
  MouseScroller.Create = function (
    getElement,
    getScrollXElement,
    getScrollYElement,
    needPreventScrolling,
    vertRecursive,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseUpMissed
  ) {
    var element = getElement();
    if (!element) return;
    if (!element.dxMouseScroller)
      element.dxMouseScroller = new MouseScroller.Extender(
        getElement,
        getScrollXElement,
        getScrollYElement,
        needPreventScrolling,
        vertRecursive,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseUpMissed
      );
    return element.dxMouseScroller;
  };
  MouseScroller.Extender = function (
    getElement,
    getScrollXElement,
    getScrollYElement,
    needPreventScrolling,
    vertRecursive,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseUpMissed
  ) {
    this.getElement = getElement;
    this.getScrollXElement = getScrollXElement;
    this.getScrollYElement = getScrollYElement;
    this.needPreventScrolling = needPreventScrolling;
    this.vertRecursive = !!vertRecursive;
    this.createHandlers(
      onMouseDown || function () {},
      onMouseMove || function () {},
      onMouseUp || function () {},
      onMouseUpMissed || function () {}
    );
    this.update();
  };
  MouseScroller.Extender.prototype = {
    update: function () {
      if (this.element)
        Evt.DetachEventFromElement(
          this.element,
          ASPx.TouchUIHelper.touchMouseDownEventName,
          this.mouseDownHandler
        );
      this.element = this.getElement();
      Evt.AttachEventToElement(
        this.element,
        ASPx.TouchUIHelper.touchMouseDownEventName,
        this.mouseDownHandler
      );
      Evt.AttachEventToElement(this.element, "click", this.mouseClickHandler);
      if (
        Browser.MSTouchUI &&
        this.element.className.indexOf(
          ASPx.TouchUIHelper.msTouchDraggableClassName
        ) < 0
      )
        this.element.className +=
          " " + ASPx.TouchUIHelper.msTouchDraggableClassName;
      this.scrollXElement = this.getScrollXElement();
      this.scrollYElement = this.getScrollYElement();
    },
    createHandlers: function (
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseUpMissed
    ) {
      var mouseDownCounter = 0;
      this.onMouseDown = onMouseDown;
      this.onMouseMove = onMouseMove;
      this.onMouseUp = onMouseUp;
      this.mouseDownHandler = function (e) {
        if (mouseDownCounter++ > 0) {
          this.finishScrolling();
          onMouseUpMissed();
        }
        var eventSource = Evt.GetEventSource(e);
        var requirePreventCustonScroll =
          ASPx.IsExists(ASPx.TouchUIHelper.RequirePreventCustomScroll) &&
          ASPx.TouchUIHelper.RequirePreventCustomScroll(
            eventSource,
            this.element
          );
        if (
          requirePreventCustonScroll ||
          (this.needPreventScrolling && this.needPreventScrolling(eventSource))
        )
          return;
        this.scrollableTreeLine = this.GetScrollableElements();
        this.firstX = this.prevX = Evt.GetEventX(e);
        this.firstY = this.prevY = this.GetEventY(e);
        Evt.AttachEventToDocument(
          ASPx.TouchUIHelper.touchMouseMoveEventName,
          this.mouseMoveHandler
        );
        Evt.AttachEventToDocument(
          ASPx.TouchUIHelper.touchMouseUpEventName,
          this.mouseUpHandler
        );
        this.onMouseDown(e);
      }.aspxBind(this);
      this.mouseMoveHandler = function (e) {
        if (ASPx.TouchUIHelper.isGesture) return;
        var x = Evt.GetEventX(e);
        var y = this.GetEventY(e);
        var xDiff = this.prevX - x;
        var yDiff = this.prevY - y;
        if (this.vertRecursive) {
          var isTopDirection = yDiff < 0;
          this.scrollYElement = this.GetElementForVertScrolling(
            isTopDirection,
            this.prevIsTopDirection,
            this.scrollYElement
          );
          this.prevIsTopDirection = isTopDirection;
        }
        if (this.scrollXElement && xDiff != 0)
          this.scrollXElement.scrollLeft += xDiff;
        if (this.scrollYElement && yDiff != 0)
          this.scrollYElement.scrollTop += yDiff;
        this.prevX = x;
        this.prevY = y;
        e.preventDefault();
        this.onMouseMove(e);
      }.aspxBind(this);
      this.mouseUpHandler = function (e) {
        this.finishScrolling();
        this.onMouseUp(e);
      }.aspxBind(this);
      this.mouseClickHandler = function (e) {
        if (
          this.needPreventScrolling &&
          this.needPreventScrolling(Evt.GetEventSource(e))
        )
          return;
        var xDiff = this.firstX - Evt.GetEventX(e);
        var yDiff = this.firstY - Evt.GetEventY(e);
        if (
          xDiff > MouseScroller.MinimumOffset ||
          yDiff > MouseScroller.MinimumOffset
        )
          return Evt.PreventEventAndBubble(e);
      }.aspxBind(this);
      this.finishScrolling = function () {
        Evt.DetachEventFromDocument(
          ASPx.TouchUIHelper.touchMouseMoveEventName,
          this.mouseMoveHandler
        );
        Evt.DetachEventFromDocument(
          ASPx.TouchUIHelper.touchMouseUpEventName,
          this.mouseUpHandler
        );
        this.scrollableTreeLine = [];
        this.prevIsTopDirection = null;
        mouseDownCounter--;
      };
    },
    GetEventY: function (e) {
      return Evt.GetEventY(e) - ASPx.GetDocumentScrollTop();
    },
    GetScrollableElements: function () {
      var result = [];
      var el = this.element;
      while (el && el != document && this.vertRecursive) {
        if (this.CanVertScroll(el) || el.tagName == "HTML") result.push(el);
        el = el.parentNode;
      }
      return result;
    },
    CanVertScroll: function (element) {
      var style = ASPx.GetCurrentStyle(element);
      return (
        style.overflow == "scroll" ||
        style.overflow == "auto" ||
        style.overflowY == "scroll" ||
        style.overflowY == "auto"
      );
    },
    GetElementForVertScrolling: function (
      currentIsTop,
      prevIsTop,
      prevElement
    ) {
      if (
        prevElement &&
        currentIsTop === prevIsTop &&
        this.GetVertScrollExcess(prevElement, currentIsTop) > 0
      )
        return prevElement;
      for (var i = 0; i < this.scrollableTreeLine.length; i++) {
        var element = this.scrollableTreeLine[i];
        var excess = this.GetVertScrollExcess(element, currentIsTop);
        if (excess > 0) return element;
      }
      return null;
    },
    GetVertScrollExcess: function (element, isTop) {
      if (isTop) return element.scrollTop;
      return element.scrollHeight - element.clientHeight - element.scrollTop;
    },
  };
  ASPx.MouseScroller = MouseScroller;
  var Evt = {};
  Evt.GetEvent = function (evt) {
    return typeof event != "undefined" && event != null && Browser.IE
      ? event
      : evt;
  };
  Evt.IsEventPrevented = function (evt) {
    return evt.defaultPrevented || evt.returnValue === false;
  };
  Evt.PreventEvent = function (evt) {
    if (evt.preventDefault) evt.preventDefault();
    else evt.returnValue = false;
    return false;
  };
  Evt.PreventEventAndBubble = function (evt) {
    Evt.PreventEvent(evt);
    if (evt.stopPropagation) evt.stopPropagation();
    evt.cancelBubble = true;
    return false;
  };
  Evt.CancelBubble = function (evt) {
    evt.cancelBubble = true;
    return false;
  };
  Evt.PreventImageDragging = function (image) {
    if (image) {
      if (Browser.NetscapeFamily)
        image.onmousedown = function (evt) {
          evt.cancelBubble = true;
          return false;
        };
      else
        image.ondragstart = function () {
          return false;
        };
    }
  };
  Evt.PreventDragStart = function (evt) {
    evt = Evt.GetEvent(evt);
    var element = Evt.GetEventSource(evt);
    if (element.releaseCapture) element.releaseCapture();
    return false;
  };
  Evt.PreventElementDrag = function (element) {
    if (Browser.IE)
      Evt.AttachEventToElement(element, "dragstart", Evt.PreventEvent);
    else Evt.AttachEventToElement(element, "mousedown", Evt.PreventEvent);
  };
  Evt.PreventElementDragAndSelect = function (
    element,
    skipMouseMove,
    skipIESelect
  ) {
    if (Browser.WebKitFamily)
      Evt.AttachEventToElement(
        element,
        "selectstart",
        Evt.PreventEventAndBubble
      );
    if (Browser.IE) {
      if (!skipIESelect)
        Evt.AttachEventToElement(element, "selectstart", ASPx.FalseFunction);
      if (!skipMouseMove)
        Evt.AttachEventToElement(
          element,
          "mousemove",
          Selection.ClearOnMouseMove
        );
      Evt.AttachEventToElement(element, "dragstart", Evt.PreventDragStart);
    }
  };
  Evt.GetEventSource = function (evt) {
    if (!ASPx.IsExists(evt)) return null;
    return evt.srcElement ? evt.srcElement : evt.target;
  };
  Evt.GetKeyCode = function (srcEvt) {
    return Browser.NetscapeFamily || Browser.Opera
      ? srcEvt.which
      : srcEvt.keyCode;
  };
  function clientEventRequiresDocScrollCorrection() {
    var isSafariVerLess3 = Browser.Safari && Browser.Version < 3,
      isMacOSMobileVerLess51 =
        Browser.MacOSMobilePlatform && Browser.Version < 5.1,
      isAndroidChrome = Browser.AndroidMobilePlatform && Browser.Chrome;
    return (
      Browser.AndroidDefaultBrowser ||
      !(isSafariVerLess3 || isMacOSMobileVerLess51 || isAndroidChrome)
    );
  }
  Evt.GetEventX = function (evt) {
    if (ASPx.TouchUIHelper.isTouchEvent(evt))
      return ASPx.TouchUIHelper.getEventX(evt);
    if (
      Browser.AndroidMobilePlatform &&
      Browser.Chrome &&
      evt.pageX !== undefined
    )
      return evt.pageX;
    return (
      evt.clientX +
      (clientEventRequiresDocScrollCorrection()
        ? ASPx.GetDocumentScrollLeft()
        : 0)
    );
  };
  Evt.GetEventY = function (evt) {
    if (ASPx.TouchUIHelper.isTouchEvent(evt))
      return ASPx.TouchUIHelper.getEventY(evt);
    if (
      Browser.AndroidMobilePlatform &&
      Browser.Chrome &&
      evt.pageY !== undefined
    )
      return evt.pageY;
    return (
      evt.clientY +
      (clientEventRequiresDocScrollCorrection()
        ? ASPx.GetDocumentScrollTop()
        : 0)
    );
  };
  Evt.IsLeftButtonPressed = function (evt) {
    if (ASPx.TouchUIHelper.isTouchEvent(evt)) return true;
    evt = Evt.GetEvent(evt);
    if (!evt) return false;
    if (Browser.IE && Browser.Version < 11) {
      if (Browser.MSTouchUI) return true;
      return evt.button % 2 == 1;
    } else if (
      Browser.NetscapeFamily ||
      Browser.WebKitFamily ||
      (Browser.IE && Browser.Version >= 11) ||
      Browser.Edge
    )
      return evt.which == 1;
    else if (Browser.Opera) return evt.button == 0;
    return true;
  };
  Evt.IsRightButtonPressed = function (evt) {
    evt = Evt.GetEvent(evt);
    if (!ASPx.IsExists(evt)) return false;
    if (Browser.IE || Browser.Edge) return evt.button == 2;
    else if (Browser.NetscapeFamily || Browser.WebKitFamily)
      return evt.which == 3;
    else if (Browser.Opera) return evt.button == 1;
    return true;
  };
  Evt.GetWheelDelta = function (evt) {
    var ret = Browser.NetscapeFamily ? -evt.detail : evt.wheelDelta;
    if (Browser.Opera && Browser.Version < 9) ret = -ret;
    return ret;
  };
  Evt.AttachEventToElement = function (element, eventName, func, onlyBubbling) {
    if (element.addEventListener)
      element.addEventListener(eventName, func, !onlyBubbling);
    else element.attachEvent("on" + eventName, func);
  };
  Evt.DetachEventFromElement = function (element, eventName, func) {
    if (element.removeEventListener)
      element.removeEventListener(eventName, func, true);
    else element.detachEvent("on" + eventName, func);
  };
  Evt.AttachEventToDocument = function (eventName, func) {
    var attachingAllowed = ASPx.TouchUIHelper.onEventAttachingToDocument(
      eventName,
      func
    );
    if (attachingAllowed) Evt.AttachEventToDocumentCore(eventName, func);
  };
  Evt.AttachEventToDocumentCore = function (eventName, func) {
    Evt.AttachEventToElement(document, eventName, func);
  };
  Evt.DetachEventFromDocument = function (eventName, func) {
    Evt.DetachEventFromDocumentCore(eventName, func);
    ASPx.TouchUIHelper.onEventDettachedFromDocument(eventName, func);
  };
  Evt.DetachEventFromDocumentCore = function (eventName, func) {
    Evt.DetachEventFromElement(document, eventName, func);
  };
  Evt.GetMouseWheelEventName = function () {
    return Browser.NetscapeFamily ? "DOMMouseScroll" : "mousewheel";
  };
  Evt.AttachMouseEnterToElement = function (
    element,
    onMouseOverHandler,
    onMouseOutHandler
  ) {
    Evt.AttachEventToElement(
      element,
      ASPx.TouchUIHelper.pointerEnabled
        ? ASPx.TouchUIHelper.pointerOverEventName
        : "mouseover",
      function (evt) {
        mouseEnterHandler(evt, element, onMouseOverHandler, onMouseOutHandler);
      }
    );
    Evt.AttachEventToElement(
      element,
      ASPx.TouchUIHelper.pointerEnabled
        ? ASPx.TouchUIHelper.pointerOutEventName
        : "mouseout",
      function (evt) {
        mouseEnterHandler(evt, element, onMouseOverHandler, onMouseOutHandler);
      }
    );
  };
  Evt.GetEventRelatedTarget = function (evt, isMouseOverEvent) {
    return (
      evt.relatedTarget || (isMouseOverEvent ? evt.srcElement : evt.toElement)
    );
  };
  function mouseEnterHandler(
    evt,
    element,
    onMouseOverHandler,
    onMouseOutHandler
  ) {
    var isMouseOverExecuted = !!element.dxMouseOverExecuted;
    var isMouseOverEvent =
      evt.type == "mouseover" ||
      evt.type == ASPx.TouchUIHelper.pointerOverEventName;
    if (
      (isMouseOverEvent && isMouseOverExecuted) ||
      (!isMouseOverEvent && !isMouseOverExecuted)
    )
      return;
    var source = Evt.GetEventRelatedTarget(evt, isMouseOverEvent);
    if (!ASPx.GetIsParent(element, source)) {
      element.dxMouseOverExecuted = isMouseOverEvent;
      if (isMouseOverEvent) onMouseOverHandler(element);
      else onMouseOutHandler(element);
    } else if (isMouseOverEvent && !isMouseOverExecuted) {
      element.dxMouseOverExecuted = true;
      onMouseOverHandler(element);
    }
  }
  Evt.DispatchEvent = function (target, eventName, canBubble, cancellable) {
    var event;
    if (Browser.IE && Browser.Version < 9) {
      eventName = "on" + eventName;
      if (eventName in target) {
        event = document.createEventObject();
        target.fireEvent("on" + eventName, event);
      }
    } else {
      event = document.createEvent("Event");
      event.initEvent(eventName, canBubble || false, cancellable || false);
      target.dispatchEvent(event);
    }
  };
  Evt.EmulateDocumentOnMouseDown = function (evt) {
    Evt.EmulateOnMouseDown(document, evt);
  };
  Evt.EmulateOnMouseDown = function (element, evt) {
    if (Browser.IE && Browser.Version < 9)
      element.fireEvent("onmousedown", evt);
    else if (!Browser.WebKitFamily) {
      var emulatedEvt = document.createEvent("MouseEvents");
      emulatedEvt.initMouseEvent(
        "mousedown",
        true,
        true,
        window,
        0,
        evt.screenX,
        evt.screenY,
        evt.clientX,
        evt.clientY,
        evt.ctrlKey,
        evt.altKey,
        evt.shiftKey,
        false,
        0,
        null
      );
      element.dispatchEvent(emulatedEvt);
    }
  };
  Evt.DoElementClick = function (element) {
    try {
      element.click();
    } catch (e) {}
  };
  ASPx.Evt = Evt;
  var Attr = {};
  Attr.GetAttribute = function (obj, attrName) {
    if (obj.getAttribute) return obj.getAttribute(attrName);
    else if (obj.getPropertyValue) return obj.getPropertyValue(attrName);
    return null;
  };
  Attr.SetAttribute = function (obj, attrName, value) {
    if (obj.setAttribute) obj.setAttribute(attrName, value);
    else if (obj.setProperty) obj.setProperty(attrName, value, "");
  };
  Attr.RemoveAttribute = function (obj, attrName) {
    if (obj.removeAttribute) obj.removeAttribute(attrName);
    else if (obj.removeProperty) obj.removeProperty(attrName);
  };
  Attr.IsExistsAttribute = function (obj, attrName) {
    var value = Attr.GetAttribute(obj, attrName);
    return value != null && value !== "";
  };
  Attr.SetOrRemoveAttribute = function (obj, attrName, value) {
    if (!value) Attr.RemoveAttribute(obj, attrName);
    else Attr.SetAttribute(obj, attrName, value);
  };
  Attr.SaveAttribute = function (obj, attrName, savedObj, savedAttrName) {
    if (!Attr.IsExistsAttribute(savedObj, savedAttrName)) {
      var oldValue = Attr.IsExistsAttribute(obj, attrName)
        ? Attr.GetAttribute(obj, attrName)
        : ASPx.EmptyObject;
      Attr.SetAttribute(savedObj, savedAttrName, oldValue);
    }
  };
  Attr.SaveStyleAttribute = function (obj, attrName) {
    Attr.SaveAttribute(obj.style, attrName, obj, "saved" + attrName);
  };
  Attr.ChangeAttributeExtended = function (
    obj,
    attrName,
    savedObj,
    savedAttrName,
    newValue
  ) {
    Attr.SaveAttribute(obj, attrName, savedObj, savedAttrName);
    Attr.SetAttribute(obj, attrName, newValue);
  };
  Attr.ChangeAttribute = function (obj, attrName, newValue) {
    Attr.ChangeAttributeExtended(
      obj,
      attrName,
      obj,
      "saved" + attrName,
      newValue
    );
  };
  Attr.ChangeStyleAttribute = function (obj, attrName, newValue) {
    Attr.ChangeAttributeExtended(
      obj.style,
      attrName,
      obj,
      "saved" + attrName,
      newValue
    );
  };
  Attr.ResetAttributeExtended = function (
    obj,
    attrName,
    savedObj,
    savedAttrName
  ) {
    Attr.SaveAttribute(obj, attrName, savedObj, savedAttrName);
    Attr.SetAttribute(obj, attrName, "");
    Attr.RemoveAttribute(obj, attrName);
  };
  Attr.ResetAttribute = function (obj, attrName) {
    Attr.ResetAttributeExtended(obj, attrName, obj, "saved" + attrName);
  };
  Attr.ResetStyleAttribute = function (obj, attrName) {
    Attr.ResetAttributeExtended(obj.style, attrName, obj, "saved" + attrName);
  };
  Attr.RestoreAttributeExtended = function (
    obj,
    attrName,
    savedObj,
    savedAttrName
  ) {
    if (Attr.IsExistsAttribute(savedObj, savedAttrName)) {
      var oldValue = Attr.GetAttribute(savedObj, savedAttrName);
      if (oldValue != ASPx.EmptyObject)
        Attr.SetAttribute(obj, attrName, oldValue);
      else Attr.RemoveAttribute(obj, attrName);
      Attr.RemoveAttribute(savedObj, savedAttrName);
      return true;
    }
    return false;
  };
  Attr.RestoreAttribute = function (obj, attrName) {
    return Attr.RestoreAttributeExtended(
      obj,
      attrName,
      obj,
      "saved" + attrName
    );
  };
  Attr.RestoreStyleAttribute = function (obj, attrName) {
    return Attr.RestoreAttributeExtended(
      obj.style,
      attrName,
      obj,
      "saved" + attrName
    );
  };
  Attr.CopyAllAttributes = function (sourceElem, destElement) {
    var attrs = sourceElem.attributes;
    for (var n = 0; n < attrs.length; n++) {
      var attr = attrs[n];
      if (attr.specified) {
        var attrName = attr.nodeName;
        var attrValue = sourceElem.getAttribute(attrName, 2);
        if (attrValue == null) attrValue = attr.nodeValue;
        destElement.setAttribute(attrName, attrValue, 0);
      }
    }
    if (sourceElem.style.cssText !== "")
      destElement.style.cssText = sourceElem.style.cssText;
  };
  Attr.RemoveAllAttributes = function (element, excludedAttributes) {
    var excludedAttributesHashTable = {};
    if (excludedAttributes)
      excludedAttributesHashTable =
        Data.CreateHashTableFromArray(excludedAttributes);
    if (element.attributes) {
      var attrArray = element.attributes;
      for (var i = 0; i < attrArray.length; i++) {
        var attrName = attrArray[i].name;
        if (
          !ASPx.IsExists(excludedAttributesHashTable[attrName.toLowerCase()])
        ) {
          try {
            attrArray.removeNamedItem(attrName);
          } catch (e) {}
        }
      }
    }
  };
  Attr.RemoveStyleAttribute = function (element, attrName) {
    if (element.style) {
      if (Browser.Firefox && element.style[attrName])
        element.style[attrName] = "";
      if (element.style.removeAttribute && element.style.removeAttribute != "")
        element.style.removeAttribute(attrName);
      else if (
        element.style.removeProperty &&
        element.style.removeProperty != ""
      )
        element.style.removeProperty(attrName);
    }
  };
  Attr.RemoveAllStyles = function (element) {
    if (element.style) {
      for (var key in element.style) Attr.RemoveStyleAttribute(element, key);
      Attr.RemoveAttribute(element, "style");
    }
  };
  Attr.GetTabIndexAttributeName = function () {
    return Browser.IE ? "tabIndex" : "tabindex";
  };
  Attr.ChangeTabIndexAttribute = function (element) {
    var attribute = Attr.GetTabIndexAttributeName();
    if (Attr.GetAttribute(element, attribute) != -1)
      Attr.ChangeAttribute(element, attribute, -1);
  };
  Attr.SaveTabIndexAttributeAndReset = function (element) {
    var attribute = Attr.GetTabIndexAttributeName();
    Attr.SaveAttribute(element, attribute, element, "saved" + attribute);
    Attr.SetAttribute(element, attribute, -1);
  };
  Attr.RestoreTabIndexAttribute = function (element) {
    var attribute = Attr.GetTabIndexAttributeName();
    if (Attr.IsExistsAttribute(element, attribute)) {
      if (Attr.GetAttribute(element, attribute) == -1) {
        if (Attr.IsExistsAttribute(element, "saved" + attribute)) {
          var oldValue = Attr.GetAttribute(element, "saved" + attribute);
          if (oldValue != ASPx.EmptyObject)
            Attr.SetAttribute(element, attribute, oldValue);
          else {
            if (Browser.WebKitFamily) Attr.SetAttribute(element, attribute, 0);
            Attr.RemoveAttribute(element, attribute);
          }
          Attr.RemoveAttribute(element, "saved" + attribute);
        }
      }
    }
  };
  Attr.ChangeAttributesMethod = function (enabled) {
    return enabled ? Attr.RestoreAttribute : Attr.ResetAttribute;
  };
  Attr.InitiallyChangeAttributesMethod = function (enabled) {
    return enabled ? Attr.ChangeAttribute : Attr.ResetAttribute;
  };
  Attr.ChangeStyleAttributesMethod = function (enabled) {
    return enabled ? Attr.RestoreStyleAttribute : Attr.ResetStyleAttribute;
  };
  Attr.InitiallyChangeStyleAttributesMethod = function (enabled) {
    return enabled ? Attr.ChangeStyleAttribute : Attr.ResetStyleAttribute;
  };
  Attr.ChangeEventsMethod = function (enabled) {
    return enabled ? Evt.AttachEventToElement : Evt.DetachEventFromElement;
  };
  Attr.ChangeDocumentEventsMethod = function (enabled) {
    return enabled ? Evt.AttachEventToDocument : Evt.DetachEventFromDocument;
  };
  ASPx.Attr = Attr;
  var Color = {};
  function _aspxToHex(d) {
    return d < 16 ? "0" + d.toString(16) : d.toString(16);
  }
  Color.ColorToHexadecimal = function (colorValue) {
    if (typeof colorValue == "number") {
      var r = colorValue & 0xff;
      var g = (colorValue >> 8) & 0xff;
      var b = (colorValue >> 16) & 0xff;
      return "#" + _aspxToHex(r) + _aspxToHex(g) + _aspxToHex(b);
    }
    if (colorValue && colorValue.substr(0, 3).toLowerCase() == "rgb") {
      var re = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/;
      var regResult = colorValue.toLowerCase().match(re);
      if (regResult) {
        var r = parseInt(regResult[1]);
        var g = parseInt(regResult[2]);
        var b = parseInt(regResult[3]);
        return "#" + _aspxToHex(r) + _aspxToHex(g) + _aspxToHex(b);
      }
      return null;
    }
    if (colorValue && colorValue.charAt(0) == "#") return colorValue;
    return null;
  };
  ASPx.Color = Color;
  var Url = {};
  Url.Navigate = function (url, target) {
    var javascriptPrefix = "javascript:";
    if (url == "") return;
    else if (url.indexOf(javascriptPrefix) != -1)
      eval(url.substr(javascriptPrefix.length));
    else {
      try {
        if (target != "") navigateTo(url, target);
        else location.href = url;
      } catch (e) {}
    }
  };
  Url.NavigateByLink = function (linkElement) {
    Url.Navigate(Attr.GetAttribute(linkElement, "href"), linkElement.target);
  };
  Url.GetAbsoluteUrl = function (url) {
    if (url) url = Url.getURLObject(url).href;
    return url;
  };
  var absolutePathPrefixes = [
    "about:",
    "file:///",
    "ftp://",
    "gopher://",
    "http://",
    "https://",
    "javascript:",
    "mailto:",
    "news:",
    "res://",
    "telnet://",
    "view-source:",
  ];
  Url.isAbsoluteUrl = function (url) {
    if (url) {
      for (var i = 0; i < absolutePathPrefixes.length; i++) {
        if (url.indexOf(absolutePathPrefixes[i]) == 0) return true;
      }
    }
    return false;
  };
  Url.getURLObject = function (url) {
    var link = document.createElement("A");
    link.href = url || "";
    return {
      href: link.href,
      protocol: link.protocol,
      host: link.host,
      port: link.port,
      pathname: link.pathname,
      search: link.search,
      hash: link.hash,
    };
  };
  Url.getRootRelativeUrl = function (url) {
    return getRelativeUrl(url, !Url.isRootRelativeUrl(url), true);
  };
  Url.getPathRelativeUrl = function (url) {
    return getRelativeUrl(url, !Url.isPathRelativeUrl(url), false);
  };
  function getRelativeUrl(url, isValid, isRootRelative) {
    if (
      url &&
      !/data:([^;]+\/?[^;]*)(;charset=[^;]*)?(;base64,)/.test(url) &&
      isValid
    ) {
      var urlObject = Url.getURLObject(url);
      var baseUrlObject = Url.getURLObject();
      if (
        !Url.isAbsoluteUrl(url) ||
        (urlObject.host === baseUrlObject.host &&
          urlObject.protocol === baseUrlObject.protocol)
      ) {
        url = urlObject.pathname;
        if (!isRootRelative)
          url = getPathRelativeUrl(baseUrlObject.pathname, url);
        url = url + urlObject.search + urlObject.hash;
      }
    }
    return url;
  }
  function getPathRelativeUrl(baseUrl, url) {
    var requestSegments = getSegments(baseUrl, false);
    var urlSegments = getSegments(url, true);
    return buildPathRelativeUrl(requestSegments, urlSegments, 0, 0, "");
  }
  function getSegments(url, addTail) {
    var segments = [];
    var startIndex = 0;
    var endIndex = -1;
    while ((endIndex = url.indexOf("/", startIndex)) != -1) {
      segments.push(url.substring(startIndex, ++endIndex));
      startIndex = endIndex;
    }
    if (addTail && startIndex < url.length)
      segments.push(url.substring(startIndex, url.length));
    return segments;
  }
  function buildPathRelativeUrl(
    requestSegments,
    urlSegments,
    reqIndex,
    urlIndex,
    buffer
  ) {
    if (urlIndex >= urlSegments.length) return buffer;
    if (reqIndex >= requestSegments.length)
      return buildPathRelativeUrl(
        requestSegments,
        urlSegments,
        reqIndex,
        urlIndex + 1,
        buffer + urlSegments[urlIndex]
      );
    if (
      requestSegments[reqIndex] === urlSegments[urlIndex] &&
      urlIndex === reqIndex
    )
      return buildPathRelativeUrl(
        requestSegments,
        urlSegments,
        reqIndex + 1,
        urlIndex + 1,
        buffer
      );
    return buildPathRelativeUrl(
      requestSegments,
      urlSegments,
      reqIndex + 1,
      urlIndex,
      buffer + "../"
    );
  }
  Url.isPathRelativeUrl = function (url) {
    return !!url && !Url.isAbsoluteUrl(url) && url.indexOf("/") != 0;
  };
  Url.isRootRelativeUrl = function (url) {
    return (
      !!url &&
      !Url.isAbsoluteUrl(url) &&
      url.indexOf("/") == 0 &&
      url.indexOf("//") != 0
    );
  };
  function navigateTo(url, target) {
    var lowerCaseTarget = target.toLowerCase();
    if ("_top" == lowerCaseTarget) top.location.href = url;
    else if ("_self" == lowerCaseTarget) location.href = url;
    else if ("_search" == lowerCaseTarget) window.open(url, "_blank");
    else if ("_media" == lowerCaseTarget) window.open(url, "_blank");
    else if ("_parent" == lowerCaseTarget) window.parent.location.href = url;
    else if ("_blank" == lowerCaseTarget) window.open(url, "_blank");
    else {
      var frame = getFrame(top.frames, target);
      if (frame != null) frame.location.href = url;
      else window.open(url, "_blank");
    }
  }
  ASPx.Url = Url;
  var Office = {};
  Office.getHandlerResourceUrl = function (pageUrl) {
    var url = pageUrl ? pageUrl : document.URL;
    if (url.indexOf("?") != -1) url = url.substring(0, url.indexOf("?"));
    if (url.indexOf("#") != -1) url = url.substring(0, url.indexOf("#"));
    if (/.*\.aspx$/.test(url)) url = url.substring(0, url.lastIndexOf("/") + 1);
    else if (url.lastIndexOf("/") != url.length - 1) url += "/";
    return url;
  };
  ASPx.Office = Office;
  var Json = {};
  function isValid(JsonString) {
    return !/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
      JsonString.replace(/"(\\.|[^"\\])*"/g, "")
    );
  }
  Json.Eval = function (jsonString, controlName) {
    if (isValid(jsonString)) return eval("(" + jsonString + ")");
    else
      throw new Error(
        controlName + " received incorrect JSON-data: " + jsonString
      );
  };
  Json.ToJson = function (param) {
    var paramType = typeof param;
    if (paramType == "undefined" || param == null) return null;
    if (paramType == "object" && typeof param.__toJson == "function")
      return param.__toJson();
    if (paramType == "number" || paramType == "boolean") return param;
    if (param.constructor == Date) return dateToJson(param);
    if (paramType == "string") {
      var result = param.replace(/\\/g, "\\\\");
      result = result.replace(/"/g, '\\"');
      result = result.replace(/\n/g, "\\n");
      result = result.replace(/\r/g, "\\r");
      result = result.replace(/</g, "\\u003c");
      result = result.replace(/>/g, "\\u003e");
      return '"' + result + '"';
    }
    if (param.constructor == Array) {
      var values = [];
      for (var i = 0; i < param.length; i++) {
        var jsonValue = Json.ToJson(param[i]);
        if (jsonValue === null) jsonValue = "null";
        values.push(jsonValue);
      }
      return "[" + values.join(",") + "]";
    }
    var exceptKeys = {};
    if (ASPx.Ident.IsArray(param.__toJsonExceptKeys))
      exceptKeys = Data.CreateHashTableFromArray(param.__toJsonExceptKeys);
    exceptKeys["__toJsonExceptKeys"] = 1;
    var values = [];
    for (var key in param) {
      if (ASPx.IsFunction(param[key])) continue;
      if (exceptKeys[key] == 1) continue;
      values.push(Json.ToJson(key) + ":" + Json.ToJson(param[key]));
    }
    return "{" + values.join(",") + "}";
  };
  function dateToJson(date) {
    var result = [date.getFullYear(), date.getMonth(), date.getDate()];
    var time = {
      h: date.getHours(),
      m: date.getMinutes(),
      s: date.getSeconds(),
      ms: date.getMilliseconds(),
    };
    if (time.h || time.m || time.s || time.ms) result.push(time.h);
    if (time.m || time.s || time.ms) result.push(time.m);
    if (time.s || time.ms) result.push(time.s);
    if (time.ms) result.push(time.ms);
    return "new Date(" + result.join() + ")";
  }
  ASPx.Json = Json;
  ASPx.CreateClass = function (parentClass, properties) {
    var ret = function () {
      if (ret.preparing) return delete ret.preparing;
      if (ret.constr) {
        this.constructor = ret;
        ret.constr.apply(this, arguments);
      }
    };
    ret.prototype = {};
    if (parentClass) {
      parentClass.preparing = true;
      ret.prototype = new parentClass();
      ret.prototype.constructor = parentClass;
      ret.constr = parentClass;
    }
    if (properties) {
      var constructorName = "constructor";
      for (var name in properties) {
        if (name != constructorName) ret.prototype[name] = properties[name];
      }
      if (properties[constructorName] && properties[constructorName] != Object)
        ret.constr = properties[constructorName];
    }
    return ret;
  };
  ASPx.FormatCallbackArg = function (prefix, arg) {
    if (prefix == null && arg == null) return "";
    if (prefix == null) prefix = "";
    if (arg == null) arg = "";
    if (arg != null && !ASPx.IsExists(arg.length) && ASPx.IsExists(arg.value))
      arg = arg.value;
    arg = arg.toString();
    return [prefix, "|", arg.length, "|", arg].join("");
  };
  ASPx.FormatCallbackArgs = function (callbackData) {
    var sb = [];
    for (var i = 0; i < callbackData.length; i++)
      sb.push(ASPx.FormatCallbackArg(callbackData[i][0], callbackData[i][1]));
    return sb.join("");
  };
  ASPx.ParseShortcutString = function (shortcutString) {
    if (!shortcutString) return 0;
    var isCtrlKey = false;
    var isShiftKey = false;
    var isAltKey = false;
    var isMetaKey = false;
    var keyCode = null;
    var shcKeys = shortcutString.toString().split("+");
    if (shcKeys.length > 0) {
      for (var i = 0; i < shcKeys.length; i++) {
        var key = Str.Trim(shcKeys[i].toUpperCase());
        switch (key) {
          case "CTRL":
            isCtrlKey = true;
            break;
          case "SHIFT":
            isShiftKey = true;
            break;
          case "ALT":
            isAltKey = true;
            break;
          case "CMD":
            isMetaKey = true;
            break;
          case "F1":
            keyCode = ASPx.Key.F1;
            break;
          case "F2":
            keyCode = ASPx.Key.F2;
            break;
          case "F3":
            keyCode = ASPx.Key.F3;
            break;
          case "F4":
            keyCode = ASPx.Key.F4;
            break;
          case "F5":
            keyCode = ASPx.Key.F5;
            break;
          case "F6":
            keyCode = ASPx.Key.F6;
            break;
          case "F7":
            keyCode = ASPx.Key.F7;
            break;
          case "F8":
            keyCode = ASPx.Key.F8;
            break;
          case "F9":
            keyCode = ASPx.Key.F9;
            break;
          case "F10":
            keyCode = ASPx.Key.F10;
            break;
          case "F11":
            keyCode = ASPx.Key.F11;
            break;
          case "F12":
            keyCode = ASPx.Key.F12;
            break;
          case "ENTER":
            keyCode = ASPx.Key.Enter;
            break;
          case "HOME":
            keyCode = ASPx.Key.Home;
            break;
          case "END":
            keyCode = ASPx.Key.End;
            break;
          case "LEFT":
            keyCode = ASPx.Key.Left;
            break;
          case "RIGHT":
            keyCode = ASPx.Key.Right;
            break;
          case "UP":
            keyCode = ASPx.Key.Up;
            break;
          case "DOWN":
            keyCode = ASPx.Key.Down;
            break;
          case "PAGEUP":
            keyCode = ASPx.Key.PageUp;
            break;
          case "PAGEDOWN":
            keyCode = ASPx.Key.PageDown;
            break;
          case "SPACE":
            keyCode = ASPx.Key.Space;
            break;
          case "TAB":
            keyCode = ASPx.Key.Tab;
            break;
          case "BACK":
            keyCode = ASPx.Key.Backspace;
            break;
          case "CONTEXT":
            keyCode = ASPx.Key.ContextMenu;
            break;
          case "ESCAPE":
          case "ESC":
            keyCode = ASPx.Key.Esc;
            break;
          case "DELETE":
          case "DEL":
            keyCode = ASPx.Key.Delete;
            break;
          case "INSERT":
          case "INS":
            keyCode = ASPx.Key.Insert;
            break;
          case "PLUS":
            keyCode = "+".charCodeAt(0);
            break;
          default:
            keyCode = key.charCodeAt(0);
            break;
        }
      }
    } else alert("Invalid shortcut");
    return ASPx.GetShortcutCode(
      keyCode,
      isCtrlKey,
      isShiftKey,
      isAltKey,
      isMetaKey
    );
  };
  ASPx.GetShortcutCode = function (
    keyCode,
    isCtrlKey,
    isShiftKey,
    isAltKey,
    isMetaKey
  ) {
    var value = keyCode & 0xffff;
    var flags = 0;
    flags |= isCtrlKey ? 1 << 0 : 0;
    flags |= isShiftKey ? 1 << 2 : 0;
    flags |= isAltKey ? 1 << 4 : 0;
    flags |= isMetaKey ? 1 << 8 : 0;
    value |= flags << 16;
    return value;
  };
  ASPx.GetShortcutCodeByEvent = function (evt) {
    return ASPx.GetShortcutCode(
      Evt.GetKeyCode(evt),
      evt.ctrlKey,
      evt.shiftKey,
      evt.altKey,
      ASPx.Browser.MacOSPlatform ? evt.metaKey : false
    );
  };
  ASPx.IsPasteShortcut = function (evt) {
    if (evt.type === "paste") return true;
    var keyCode = Evt.GetKeyCode(evt);
    if (Browser.NetscapeFamily && evt.which == 0) keyCode = evt.keyCode;
    return (
      (evt.ctrlKey && (keyCode == 118 || keyCode == 86)) ||
      (evt.shiftKey &&
        !evt.ctrlKey &&
        !evt.altKey &&
        keyCode == ASPx.Key.Insert)
    );
  };
  ASPx.SetFocus = function (element, selectAction) {
    function focusCore(element, selectAction) {
      try {
        element.focus();
        if (Browser.IE && document.activeElement != element) element.focus();
        if (selectAction) {
          var currentSelection = Selection.GetInfo(element);
          if (currentSelection.startPos == currentSelection.endPos) {
            switch (selectAction) {
              case "start":
                Selection.SetCaretPosition(element, 0);
                break;
              case "all":
                Selection.Set(element);
                break;
            }
          }
        }
      } catch (e) {}
    }
    if (ASPxClientUtils.iOSPlatform) focusCore(element, selectAction);
    else {
      window.setTimeout(function () {
        focusCore(element, selectAction);
      }, 100);
    }
  };
  ASPx.IsFocusableCore = function (element, skipContainerVisibilityCheck) {
    var current = element;
    while (current && current.nodeType == 1) {
      if (current == element || !skipContainerVisibilityCheck(current)) {
        if (current.tagName == "BODY") return true;
        if (
          current.disabled ||
          !ASPx.GetElementDisplay(current) ||
          !ASPx.GetElementVisibility(current)
        )
          return false;
      }
      current = current.parentNode;
    }
    return true;
  };
  ASPx.IsFocusable = function (element) {
    return ASPx.IsFocusableCore(element, ASPx.FalseFunction);
  };
  ASPx.IsExists = function (obj) {
    return typeof obj != "undefined" && obj != null;
  };
  ASPx.IsFunction = function (obj) {
    return typeof obj == "function";
  };
  ASPx.IsNumber = function (str) {
    return !isNaN(parseFloat(str)) && isFinite(str);
  };
  ASPx.GetDefinedValue = function (value, defaultValue) {
    return typeof value != "undefined" ? value : defaultValue;
  };
  ASPx.CorrectJSFloatNumber = function (number) {
    var ret = 21;
    var numString = number.toPrecision(21);
    numString = numString.replace("-", "");
    var integerDigitsCount = numString.indexOf(
      ASPx.PossibleNumberDecimalSeparators[0]
    );
    if (integerDigitsCount < 0)
      integerDigitsCount = numString.indexOf(
        ASPx.PossibleNumberDecimalSeparators[1]
      );
    var floatDigitsCount = numString.length - integerDigitsCount - 1;
    if (floatDigitsCount < 10) return number;
    if (integerDigitsCount > 0) {
      ret = integerDigitsCount + 12;
    }
    var toPrecisionNumber = Math.min(ret, 21);
    var newValueString = number.toPrecision(toPrecisionNumber);
    return parseFloat(newValueString, 10);
  };
  ASPx.CorrectRounding = function (number, step) {
    var regex = /[,|.](.*)/,
      isFloatValue = regex.test(number),
      isFloatStep = regex.test(step);
    if (isFloatValue || isFloatStep) {
      var valueAccuracy = isFloatValue ? regex.exec(number)[0].length - 1 : 0,
        stepAccuracy = isFloatStep ? regex.exec(step)[0].length - 1 : 0,
        accuracy = Math.max(valueAccuracy, stepAccuracy);
      var multiplier = Math.pow(10, accuracy);
      number = Math.round((number + step) * multiplier) / multiplier;
      return number;
    }
    return number + step;
  };
  ASPx.GetActiveElement = function () {
    try {
      return document.activeElement;
    } catch (e) {
      return null;
    }
  };
  var verticalScrollBarWidth;
  ASPx.GetVerticalScrollBarWidth = function () {
    if (typeof verticalScrollBarWidth == "undefined") {
      var container = document.createElement("DIV");
      container.style.cssText =
        "position: absolute; top: 0px; left: 0px; visibility: hidden; width: 200px; height: 150px; overflow: hidden; box-sizing: content-box";
      document.body.appendChild(container);
      var child = document.createElement("P");
      container.appendChild(child);
      child.style.cssText = "width: 100%; height: 200px;";
      var widthWithoutScrollBar = child.offsetWidth;
      container.style.overflow = "scroll";
      var widthWithScrollBar = child.offsetWidth;
      if (widthWithoutScrollBar == widthWithScrollBar)
        widthWithScrollBar = container.clientWidth;
      verticalScrollBarWidth = widthWithoutScrollBar - widthWithScrollBar;
      document.body.removeChild(container);
    }
    return verticalScrollBarWidth;
  };
  function hideScrollBarCore(element, scrollName) {
    if (element.tagName == "IFRAME") {
      if (element.scrolling == "yes" || element.scrolling == "auto") {
        Attr.ChangeAttribute(element, "scrolling", "no");
        return true;
      }
    } else if (element.tagName == "DIV") {
      if (
        element.style[scrollName] == "scroll" ||
        element.style[scrollName] == "auto"
      ) {
        Attr.ChangeStyleAttribute(element, scrollName, "hidden");
        return true;
      }
    }
    return false;
  }
  function restoreScrollBarCore(element, scrollName) {
    if (element.tagName == "IFRAME")
      return Attr.RestoreAttribute(element, "scrolling");
    else if (element.tagName == "DIV")
      return Attr.RestoreStyleAttribute(element, scrollName);
    return false;
  }
  ASPx.SetScrollBarVisibilityCore = function (element, scrollName, isVisible) {
    return isVisible
      ? restoreScrollBarCore(element, scrollName)
      : hideScrollBarCore(element, scrollName);
  };
  ASPx.SetScrollBarVisibility = function (element, isVisible) {
    if (ASPx.SetScrollBarVisibilityCore(element, "overflow", isVisible))
      return true;
    var result =
      ASPx.SetScrollBarVisibilityCore(element, "overflowX", isVisible) ||
      ASPx.SetScrollBarVisibilityCore(element, "overflowY", isVisible);
    return result;
  };
  ASPx.SetInnerHtml = function (element, html) {
    if (Browser.IE) {
      element.innerHTML = "<em>&nbsp;</em>" + html;
      element.removeChild(element.firstChild);
    } else element.innerHTML = html;
  };
  ASPx.GetInnerText = function (container) {
    if (Browser.Safari && Browser.MajorVersion <= 5) {
      var filter = getHtml2PlainTextFilter();
      filter.innerHTML = container.innerHTML;
      ASPx.SetElementDisplay(filter, true);
      var innerText = filter.innerText;
      ASPx.SetElementDisplay(filter, false);
      return innerText;
    } else if (
      Browser.NetscapeFamily ||
      Browser.WebKitFamily ||
      (Browser.IE && Browser.Version >= 9)
    ) {
      return container.textContent;
    } else return container.innerText;
  };
  var html2PlainTextFilter = null;
  function getHtml2PlainTextFilter() {
    if (html2PlainTextFilter == null) {
      html2PlainTextFilter = document.createElement("DIV");
      html2PlainTextFilter.style.width = "0";
      html2PlainTextFilter.style.height = "0";
      html2PlainTextFilter.style.overflow = "visible";
      ASPx.SetElementDisplay(html2PlainTextFilter, false);
      document.body.appendChild(html2PlainTextFilter);
    }
    return html2PlainTextFilter;
  }
  ASPx.CreateHiddenField = function (name, id) {
    var input = document.createElement("INPUT");
    input.setAttribute("type", "hidden");
    if (name) input.setAttribute("name", name);
    if (id) input.setAttribute("id", id);
    return input;
  };
  ASPx.CloneObject = function (srcObject) {
    if (typeof srcObject != "object" || srcObject == null) return srcObject;
    var newObject = {};
    for (var i in srcObject) newObject[i] = srcObject[i];
    return newObject;
  };
  ASPx.IsPercentageSize = function (size) {
    return size && size.indexOf("%") != -1;
  };
  ASPx.GetElementById = function (id) {
    if (document.getElementById) return document.getElementById(id);
    else return document.all[id];
  };
  ASPx.GetInputElementById = function (id) {
    var elem = ASPx.GetElementById(id);
    if (!Browser.IE) return elem;
    if (elem) {
      if (elem.id == id) return elem;
      else {
        for (var i = 1; i < document.all[id].length; i++) {
          if (document.all[id][i].id == id) return document.all[id][i];
        }
      }
    }
    return null;
  };
  ASPx.GetElementByIdInDocument = function (documentObj, id) {
    if (documentObj.getElementById) return documentObj.getElementById(id);
    else return documentObj.all[id];
  };
  ASPx.GetIsParent = function (parentElement, element) {
    if (!parentElement || !element) return false;
    while (element) {
      if (element === parentElement) return true;
      if (element.tagName === "BODY") return false;
      element = element.parentNode;
    }
    return false;
  };
  ASPx.GetParentById = function (element, id) {
    element = element.parentNode;
    while (element) {
      if (element.id === id) return element;
      element = element.parentNode;
    }
    return null;
  };
  ASPx.GetParentByPartialId = function (element, idPart) {
    while (element && element.tagName != "BODY") {
      if (element.id && element.id.match(idPart)) return element;
      element = element.parentNode;
    }
    return null;
  };
  ASPx.GetParentByTagName = function (element, tagName) {
    tagName = tagName.toUpperCase();
    while (element) {
      if (element.tagName === "BODY") return null;
      if (element.tagName === tagName) return element;
      element = element.parentNode;
    }
    return null;
  };
  function getParentByClassNameInternal(element, className, selector) {
    while (element != null) {
      if (element.tagName == "BODY") return null;
      if (selector(element, className)) return element;
      element = element.parentNode;
    }
    return null;
  }
  ASPx.GetParentByPartialClassName = function (element, className) {
    return getParentByClassNameInternal(
      element,
      className,
      ASPx.ElementContainsCssClass
    );
  };
  ASPx.GetParentByClassName = function (element, className) {
    return getParentByClassNameInternal(
      element,
      className,
      ASPx.ElementHasCssClass
    );
  };
  ASPx.GetParentByTagNameAndAttributeValue = function (
    element,
    tagName,
    attrName,
    attrValue
  ) {
    tagName = tagName.toUpperCase();
    while (element != null) {
      if (element.tagName == "BODY") return null;
      if (element.tagName == tagName && element[attrName] == attrValue)
        return element;
      element = element.parentNode;
    }
    return null;
  };
  ASPx.GetParent = function (element, testFunc) {
    if (!ASPx.IsExists(testFunc)) return null;
    while (element != null && element.tagName != "BODY") {
      if (testFunc(element)) return element;
      element = element.parentNode;
    }
    return null;
  };
  ASPx.GetPreviousSibling = function (el) {
    if (el.previousElementSibling) {
      return el.previousElementSibling;
    } else {
      while ((el = el.previousSibling)) {
        if (el.nodeType === 1) return el;
      }
    }
  };
  ASPx.ElementHasCssClass = function (element, className) {
    try {
      var classList = element.classList;
      var classNames = className.split(" ");
      if (!classList) var elementClasses = element.className.split(" ");
      for (var i = classNames.length - 1; i >= 0; i--) {
        if (classList) {
          if (!classList.contains(classNames[i])) return false;
          continue;
        }
        if (Data.ArrayIndexOf(elementClasses, classNames[i]) < 0) return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  };
  ASPx.ElementContainsCssClass = function (element, className) {
    try {
      return element.className.indexOf(className) != -1;
    } catch (e) {
      return false;
    }
  };
  ASPx.AddClassNameToElement = function (element, className) {
    if (!ASPx.ElementHasCssClass(element, className))
      element.className =
        element.className === ""
          ? className
          : element.className + " " + className;
  };
  ASPx.RemoveClassNameFromElement = function (element, className) {
    var updClassName = " " + element.className + " ";
    var newClassName = updClassName.replace(" " + className + " ", " ");
    if (updClassName.length != newClassName.length)
      element.className = Str.Trim(newClassName);
  };
  function nodeListToArray(nodeList, filter) {
    var result = [];
    for (var i = 0, element; (element = nodeList[i]); i++) {
      if (filter && !filter(element)) continue;
      result.push(element);
    }
    return result;
  }
  function getItemByIndex(collection, index) {
    if (!index) index = 0;
    if (collection != null && collection.length > index)
      return collection[index];
    return null;
  }
  ASPx.GetChildNodesByClassName = function (parent, className) {
    if (parent.querySelectorAll) {
      var children = parent.querySelectorAll("." + className);
      return nodeListToArray(children, function (element) {
        return element.parentNode === parent;
      });
    }
    return ASPx.GetChildNodes(parent, function (elem) {
      return elem.className && ASPx.ElementHasCssClass(elem, className);
    });
  };
  ASPx.GetChildNodesByPartialClassName = function (element, className) {
    return ASPx.GetChildElementNodesByPredicate(element, function (child) {
      return ASPx.ElementContainsCssClass(child, className);
    });
  };
  ASPx.GetChildByPartialClassName = function (element, className, index) {
    if (element != null) {
      var collection = ASPx.GetChildNodesByPartialClassName(element, className);
      return getItemByIndex(collection, index);
    }
    return null;
  };
  ASPx.GetChildByClassName = function (element, className, index) {
    if (element != null) {
      var collection = ASPx.GetChildNodesByClassName(element, className);
      return getItemByIndex(collection, index);
    }
    return null;
  };
  ASPx.GetNodesByPartialClassName = function (element, className) {
    if (element.querySelectorAll) {
      var list = element.querySelectorAll("*[class*=" + className + "]");
      return nodeListToArray(list);
    }
    var collection = element.all || element.getElementsByTagName("*");
    var ret = [];
    if (collection != null) {
      for (var i = 0; i < collection.length; i++) {
        if (ASPx.ElementContainsCssClass(collection[i], className))
          ret.push(collection[i]);
      }
    }
    return ret;
  };
  ASPx.GetNodesByClassName = function (parent, className) {
    if (parent.querySelectorAll) {
      var children = parent.querySelectorAll("." + className);
      return nodeListToArray(children);
    }
    return ASPx.GetNodes(parent, function (elem) {
      return elem.className && ASPx.ElementHasCssClass(elem, className);
    });
  };
  ASPx.GetNodeByClassName = function (element, className, index) {
    if (element != null) {
      var collection = ASPx.GetNodesByClassName(element, className);
      return getItemByIndex(collection, index);
    }
    return null;
  };
  ASPx.GetChildById = function (element, id) {
    if (element.all) {
      var child = element.all[id];
      if (!child) {
        child = element.all(id);
        if (!child) return Browser.IE ? document.getElementById(id) : null;
      }
      if (!ASPx.IsExists(child.length)) return child;
      else return ASPx.GetElementById(id);
    } else return ASPx.GetElementById(id);
  };
  ASPx.GetNodesByPartialId = function (element, partialName, list) {
    if (element.id && element.id.indexOf(partialName) > -1) list.push(element);
    if (element.childNodes) {
      for (var i = 0; i < element.childNodes.length; i++)
        ASPx.GetNodesByPartialId(element.childNodes[i], partialName, list);
    }
  };
  ASPx.GetNodesByTagName = function (element, tagName) {
    tagName = tagName.toUpperCase();
    if (element) {
      if (element.getElementsByTagName)
        return element.getElementsByTagName(tagName);
      else if (element.all && element.all.tags !== undefined)
        return Browser.Netscape
          ? element.all.tags[tagName]
          : element.all.tags(tagName);
    }
    return null;
  };
  ASPx.GetNodeByTagName = function (element, tagName, index) {
    if (element != null) {
      var collection = ASPx.GetNodesByTagName(element, tagName);
      return getItemByIndex(collection, index);
    }
    return null;
  };
  ASPx.GetChildNodesByTagName = function (parent, tagName) {
    return ASPx.GetChildNodes(parent, function (child) {
      return child.tagName === tagName;
    });
  };
  ASPx.GetChildByTagName = function (element, tagName, index) {
    if (element != null) {
      var collection = ASPx.GetChildNodesByTagName(element, tagName);
      return getItemByIndex(collection, index);
    }
    return null;
  };
  ASPx.RetrieveByPredicate = function (scourceCollection, predicate) {
    var result = [];
    for (var i = 0; i < scourceCollection.length; i++) {
      var element = scourceCollection[i];
      if (!predicate || predicate(element)) result.push(element);
    }
    return result;
  };
  ASPx.GetChildNodes = function (parent, predicate) {
    return ASPx.RetrieveByPredicate(parent.childNodes, predicate);
  };
  ASPx.GetNodes = function (parent, predicate) {
    var c = parent.all || parent.getElementsByTagName("*");
    return ASPx.RetrieveByPredicate(c, predicate);
  };
  ASPx.GetChildElementNodes = function (parent) {
    if (!parent) return null;
    return ASPx.GetChildNodes(parent, function (e) {
      return e.nodeType == 1;
    });
  };
  ASPx.GetChildElementNodesByPredicate = function (parent, predicate) {
    if (!parent) return null;
    if (!predicate) return ASPx.GetChildElementNodes(parent);
    return ASPx.GetChildNodes(parent, function (e) {
      return e.nodeType == 1 && predicate(e);
    });
  };
  ASPx.GetTextNode = function (element, index) {
    if (element != null) {
      var collection = [];
      ASPx.GetTextNodes(element, collection);
      return getItemByIndex(collection, index);
    }
    return null;
  };
  ASPx.GetTextNodes = function (element, collection) {
    for (var i = 0; i < element.childNodes.length; i++) {
      var childNode = element.childNodes[i];
      if (ASPx.IsExists(childNode.nodeValue)) collection.push(childNode);
      ASPx.GetTextNodes(childNode, collection);
    }
  };
  ASPx.GetElementDocument = function (element) {
    return element.document || element.ownerDocument;
  };
  ASPx.RemoveElement = function (element) {
    if (element && element.parentNode) element.parentNode.removeChild(element);
  };
  ASPx.ReplaceTagName = function (element, newTagName, cloneChilds) {
    if (element.nodeType != 1) return null;
    if (element.nodeName == newTagName) return element;
    cloneChilds = cloneChilds !== undefined ? cloneChilds : true;
    var doc = element.ownerDocument;
    var newElem = doc.createElement(newTagName);
    Attr.CopyAllAttributes(element, newElem);
    if (cloneChilds) {
      for (var i = 0; i < element.childNodes.length; i++)
        newElem.appendChild(element.childNodes[i].cloneNode(true));
    } else {
      for (var child; (child = element.firstChild); )
        newElem.appendChild(child);
    }
    element.parentNode.replaceChild(newElem, element);
    return newElem;
  };
  ASPx.RemoveOuterTags = function (element) {
    if (ASPx.Browser.IE) {
      element.insertAdjacentHTML("beforeBegin", element.innerHTML);
      ASPx.RemoveElement(element);
    } else {
      var docFragment = element.ownerDocument.createDocumentFragment();
      for (var i = 0; i < element.childNodes.length; i++)
        docFragment.appendChild(element.childNodes[i].cloneNode(true));
      element.parentNode.replaceChild(docFragment, element);
    }
  };
  ASPx.WrapElementInNewElement = function (element, newElementTagName) {
    var wrapElement = null;
    if (Browser.IE) {
      var wrapElement = element.ownerDocument.createElement(newElementTagName);
      wrapElement.appendChild(element.cloneNode(true));
      element.parentNode.insertBefore(wrapElement, element);
      element.parentNode.removeChild(element);
    } else {
      var docFragment = element.ownerDocument.createDocumentFragment();
      wrapElement = element.ownerDocument.createElement(newElementTagName);
      docFragment.appendChild(wrapElement);
      wrapElement.appendChild(element.cloneNode(true));
      element.parentNode.replaceChild(docFragment, element);
    }
    return wrapElement;
  };
  ASPx.InsertElementAfter = function (newElement, targetElement) {
    var parentElem = targetElement.parentNode;
    if (
      parentElem.childNodes[parentElem.childNodes.length - 1] == targetElement
    )
      parentElem.appendChild(newElement);
    else parentElem.insertBefore(newElement, targetElement.nextSibling);
  };
  ASPx.SetElementOpacity = function (element, value) {
    var useOpacityStyle = !Browser.IE || Browser.Version > 8;
    if (useOpacityStyle) {
      element.style.opacity = value;
    } else {
      if (
        typeof element.filters === "object" &&
        element.filters["DXImageTransform.Microsoft.Alpha"]
      )
        element.filters.item("DXImageTransform.Microsoft.Alpha").Opacity =
          value * 100;
      else element.style.filter = "alpha(opacity=" + value * 100 + ")";
    }
  };
  ASPx.GetElementOpacity = function (element) {
    var useOpacityStyle = !Browser.IE || Browser.Version > 8;
    if (useOpacityStyle)
      return parseFloat(ASPx.GetCurrentStyle(element).opacity);
    else {
      if (
        typeof element.filters === "object" &&
        element.filters["DXImageTransform.Microsoft.Alpha"]
      ) {
        return (
          element.filters.item("DXImageTransform.Microsoft.Alpha").Opacity / 100
        );
      } else {
        var alphaValue = ASPx.GetCurrentStyle(element).filter;
        var value = alphaValue.replace("alpha(opacity=", "");
        value = value.replace(")", "");
        return parseInt(value) / 100;
      }
      return 100;
    }
  };
  ASPx.GetElementDisplay = function (element) {
    return element.style.display != "none";
  };
  ASPx.SetElementDisplay = function (element, value) {
    if (!element) return;
    element.style.display = value ? "" : "none";
  };
  ASPx.GetElementVisibility = function (element) {
    return element.style.visibility != "hidden";
  };
  ASPx.SetElementVisibility = function (element, value) {
    if (!element) return;
    element.style.visibility = value ? "visible" : "hidden";
  };
  ASPx.IsElementVisible = function (element) {
    while (element && element.tagName != "BODY") {
      if (
        !ASPx.GetElementDisplay(element) ||
        (!ASPx.GetElementVisibility(element) &&
          !Attr.IsExistsAttribute(element, "errorFrame"))
      )
        return false;
      element = element.parentNode;
    }
    return true;
  };
  ASPx.IsElementDisplayed = function (element) {
    while (element && element.tagName != "BODY") {
      if (!ASPx.GetElementDisplay(element)) return false;
      element = element.parentNode;
    }
    return true;
  };
  ASPx.AddStyleSheetLinkToDocument = function (doc, linkUrl) {
    var newLink = createStyleLink(doc, linkUrl);
    var head = ASPx.GetHeadElementOrCreateIfNotExist(doc);
    head.appendChild(newLink);
  };
  ASPx.GetHeadElementOrCreateIfNotExist = function (doc) {
    var elements = ASPx.GetNodesByTagName(doc, "head");
    var head = null;
    if (elements.length == 0) {
      head = doc.createElement("head");
      head.visibility = "hidden";
      doc.insertBefore(head, doc.body);
    } else head = elements[0];
    return head;
  };
  function createStyleLink(doc, url) {
    var newLink = doc.createElement("link");
    Attr.SetAttribute(newLink, "href", url);
    Attr.SetAttribute(newLink, "type", "text/css");
    Attr.SetAttribute(newLink, "rel", "stylesheet");
    return newLink;
  }
  ASPx.GetCurrentStyle = function (element) {
    if (element.currentStyle) return element.currentStyle;
    else if (document.defaultView && document.defaultView.getComputedStyle) {
      var result = document.defaultView.getComputedStyle(element, null);
      if (!result && Browser.Firefox && window.frameElement) {
        var changes = [];
        var curElement = window.frameElement;
        while (
          !(result = document.defaultView.getComputedStyle(element, null))
        ) {
          changes.push([curElement, curElement.style.display]);
          ASPx.SetStylesCore(curElement, "display", "block", true);
          curElement =
            curElement.tagName == "BODY"
              ? curElement.ownerDocument.defaultView.frameElement
              : curElement.parentNode;
        }
        result = ASPx.CloneObject(result);
        for (var ch, i = 0; (ch = changes[i]); i++)
          ASPx.SetStylesCore(ch[0], "display", ch[1]);
        var reflow = document.body.offsetWidth;
      }
      return result;
    }
    return window.getComputedStyle(element, null);
  };
  ASPx.CreateStyleSheetInDocument = function (doc) {
    if (doc.createStyleSheet) {
      try {
        return doc.createStyleSheet();
      } catch (e) {
        var message =
          "The CSS link limit (31) has been exceeded. Please enable CSS merging or reduce the number of CSS files on the page. For details, see http://www.devexpress.com/Support/Center/p/K18487.aspx.";
        throw new Error(message);
      }
    } else {
      var styleSheet = doc.createElement("STYLE");
      ASPx.GetNodeByTagName(doc, "HEAD", 0).appendChild(styleSheet);
      return styleSheet.sheet;
    }
  };
  ASPx.currentStyleSheet = null;
  ASPx.GetCurrentStyleSheet = function () {
    if (!ASPx.currentStyleSheet)
      ASPx.currentStyleSheet = ASPx.CreateStyleSheetInDocument(document);
    return ASPx.currentStyleSheet;
  };
  function getStyleSheetRules(styleSheet) {
    try {
      return Browser.IE && Browser.Version == 8
        ? styleSheet.rules
        : styleSheet.cssRules;
    } catch (e) {
      return null;
    }
  }
  ASPx.cachedCssRules = {};
  ASPx.GetStyleSheetRules = function (className, stylesStorageDocument) {
    var doc = stylesStorageDocument || document;
    if (ASPx.cachedCssRules[className]) {
      if (ASPx.cachedCssRules[className] != ASPx.EmptyObject)
        return ASPx.cachedCssRules[className];
      return null;
    }
    for (var i = 0; i < doc.styleSheets.length; i++) {
      var styleSheet = doc.styleSheets[i];
      var rules = getStyleSheetRules(styleSheet);
      if (rules != null) {
        for (var j = 0; j < rules.length; j++) {
          if (rules[j].selectorText == "." + className) {
            ASPx.cachedCssRules[className] = rules[j];
            return rules[j];
          }
        }
      }
    }
    ASPx.cachedCssRules[className] = ASPx.EmptyObject;
    return null;
  };
  ASPx.ClearCachedCssRules = function () {
    ASPx.cachedCssRules = {};
  };
  var styleCount = 0;
  var styleNameCache = {};
  ASPx.CreateImportantStyleRule = function (
    styleSheet,
    cssText,
    postfix,
    prefix
  ) {
    styleSheet = styleSheet || ASPx.GetCurrentStyleSheet();
    var cacheKey =
      (postfix ? postfix + "||" : "") + cssText + (prefix ? "||" + prefix : "");
    if (styleNameCache[cacheKey]) return styleNameCache[cacheKey];
    prefix = prefix ? prefix + " " : "";
    var className = "dxh" + styleCount + (postfix ? postfix : "");
    ASPx.AddStyleSheetRule(
      styleSheet,
      prefix + "." + className,
      ASPx.CreateImportantCssText(cssText)
    );
    styleCount++;
    styleNameCache[cacheKey] = className;
    return className;
  };
  ASPx.CreateImportantCssText = function (cssText) {
    var newText = "";
    var attributes = cssText.split(";");
    for (var i = 0; i < attributes.length; i++) {
      if (attributes[i] != "") newText += attributes[i] + " !important;";
    }
    return newText;
  };
  ASPx.AddStyleSheetRule = function (styleSheet, selector, cssText) {
    if (!cssText) return;
    if (Browser.IE) styleSheet.addRule(selector, cssText);
    else
      styleSheet.insertRule(
        selector + " { " + cssText + " }",
        styleSheet.cssRules.length
      );
  };
  ASPx.GetPointerCursor = function () {
    return "pointer";
  };
  ASPx.SetPointerCursor = function (element) {
    if (element.style.cursor == "")
      element.style.cursor = ASPx.GetPointerCursor();
  };
  ASPx.SetElementFloat = function (element, value) {
    if (ASPx.IsExists(element.style.cssFloat)) element.style.cssFloat = value;
    else if (ASPx.IsExists(element.style.styleFloat))
      element.style.styleFloat = value;
    else Attr.SetAttribute(element.style, "float", value);
  };
  ASPx.GetElementFloat = function (element) {
    var currentStyle = ASPx.GetCurrentStyle(element);
    if (ASPx.IsExists(currentStyle.cssFloat)) return currentStyle.cssFloat;
    if (ASPx.IsExists(currentStyle.styleFloat)) return currentStyle.styleFloat;
    return Attr.GetAttribute(currentStyle, "float");
  };
  function getElementDirection(element) {
    return ASPx.GetCurrentStyle(element).direction;
  }
  ASPx.IsElementRightToLeft = function (element) {
    return getElementDirection(element) == "rtl";
  };
  ASPx.AdjustVerticalMarginsInContainer = function (container) {
    var containerBorderAndPaddings =
      ASPx.GetTopBottomBordersAndPaddingsSummaryValue(container);
    var flowElements = [],
      floatElements = [],
      floatTextElements = [];
    var maxHeight = 0,
      maxFlowHeight = 0;
    for (var i = 0; i < container.childNodes.length; i++) {
      var element = container.childNodes[i];
      if (!element.offsetHeight) continue;
      ASPx.ClearVerticalMargins(element);
    }
    for (var i = 0; i < container.childNodes.length; i++) {
      var element = container.childNodes[i];
      if (!element.offsetHeight) continue;
      var float = ASPx.GetElementFloat(element);
      var isFloat = float === "left" || float === "right";
      if (isFloat) floatElements.push(element);
      else {
        flowElements.push(element);
        if (element.tagName !== "IMG") {
          if (!ASPx.IsTextWrapped(element))
            element.style.verticalAlign = "baseline";
          floatTextElements.push(element);
        }
        if (element.tagName === "DIV")
          Attr.ChangeStyleAttribute(element, "float", "left");
      }
      if (element.offsetHeight > maxHeight) maxHeight = element.offsetHeight;
      if (!isFloat && element.offsetHeight > maxFlowHeight)
        maxFlowHeight = element.offsetHeight;
    }
    for (var i = 0; i < flowElements.length; i++)
      Attr.RestoreStyleAttribute(flowElements[i], "float");
    var containerBorderAndPaddings =
      ASPx.GetTopBottomBordersAndPaddingsSummaryValue(container);
    var containerHeight = container.offsetHeight - containerBorderAndPaddings;
    if (maxHeight == containerHeight) {
      var verticalAlign = ASPx.GetCurrentStyle(container).verticalAlign;
      for (var i = 0; i < floatTextElements.length; i++)
        floatTextElements[i].style.verticalAlign = "";
      containerHeight = container.offsetHeight - containerBorderAndPaddings;
      for (var i = 0; i < floatElements.length; i++)
        adjustVerticalMarginsCore(
          floatElements[i],
          containerHeight,
          verticalAlign,
          true
        );
      for (var i = 0; i < flowElements.length; i++) {
        if (maxFlowHeight != maxHeight)
          adjustVerticalMarginsCore(
            flowElements[i],
            containerHeight,
            verticalAlign
          );
      }
    }
  };
  ASPx.AdjustVerticalMargins = function (element) {
    ASPx.ClearVerticalMargins(element);
    var parentElement = element.parentNode;
    var parentHeight =
      parentElement.offsetHeight -
      ASPx.GetTopBottomBordersAndPaddingsSummaryValue(parentElement);
    adjustVerticalMarginsCore(
      element,
      parentHeight,
      ASPx.GetCurrentStyle(parentElement).verticalAlign
    );
  };
  function adjustVerticalMarginsCore(
    element,
    parentHeight,
    verticalAlign,
    toBottom
  ) {
    var marginTop;
    if (verticalAlign == "top") marginTop = 0;
    else if (verticalAlign == "bottom")
      marginTop = parentHeight - element.offsetHeight;
    else marginTop = (parentHeight - element.offsetHeight) / 2;
    if (marginTop !== 0) {
      var marginAttr =
        (toBottom ? Math.ceil(marginTop) : Math.floor(marginTop)) + "px";
      element.style.marginTop = marginAttr;
    }
  }
  ASPx.ClearVerticalMargins = function (element) {
    element.style.marginTop = "";
    element.style.marginBottom = "";
  };
  ASPx.AdjustHeightInContainer = function (container) {
    var height =
      container.offsetHeight -
      ASPx.GetTopBottomBordersAndPaddingsSummaryValue(container);
    for (var i = 0; i < container.childNodes.length; i++) {
      var element = container.childNodes[i];
      if (!element.offsetHeight) continue;
      ASPx.ClearHeight(element);
    }
    var elements = [];
    var childrenHeight = 0;
    for (var i = 0; i < container.childNodes.length; i++) {
      var element = container.childNodes[i];
      if (!element.offsetHeight) continue;
      childrenHeight +=
        element.offsetHeight + ASPx.GetTopBottomMargins(element);
      elements.push(element);
    }
    if (elements.length > 0 && childrenHeight < height) {
      var correctedHeight = 0;
      for (var i = 0; i < elements.length; i++) {
        var elementHeight = 0;
        if (i < elements.length - 1) {
          var elementHeight = Math.floor(height / elements.length);
          correctedHeight += elementHeight;
        } else {
          var elementHeight = height - correctedHeight;
          if (elementHeight < 0) elementHeight = 0;
        }
        adjustHeightCore(elements[i], elementHeight);
      }
    }
  };
  ASPx.AdjustHeight = function (element) {
    ASPx.ClearHeight(element);
    var parentElement = element.parentNode;
    var height =
      parentElement.offsetHeight -
      ASPx.GetTopBottomBordersAndPaddingsSummaryValue(parentElement);
    adjustHeightCore(element, height);
  };
  function adjustHeightCore(element, height) {
    var height =
      height - ASPx.GetTopBottomBordersAndPaddingsSummaryValue(element);
    if (height < 0) height = 0;
    element.style.height = height + "px";
  }
  ASPx.ClearHeight = function (element) {
    element.style.height = "";
  };
  ASPx.ShrinkWrappedTextInContainer = function (container) {
    if (!container) return;
    for (var i = 0; i < container.childNodes.length; i++) {
      var child = container.childNodes[i];
      if (child.style && ASPx.IsTextWrapped(child)) {
        Attr.ChangeStyleAttribute(child, "width", "1px");
        child.shrinkedTextContainer = true;
      }
    }
  };
  ASPx.AdjustWrappedTextInContainer = function (container) {
    if (!container) return;
    var textContainer,
      leftWidth = 0,
      rightWidth = 0;
    for (var i = 0; i < container.childNodes.length; i++) {
      var child = container.childNodes[i];
      if (child.tagName === "BR") return;
      if (!child.tagName) continue;
      if (child.tagName !== "IMG") {
        textContainer = child;
        if (ASPx.IsTextWrapped(textContainer)) {
          if (!textContainer.shrinkedTextContainer)
            textContainer.style.width = "";
          textContainer.style.marginRight = "";
        }
      } else {
        if (child.offsetWidth === 0) {
          Evt.AttachEventToElement(child, "load", function (evt) {
            ASPx.AdjustWrappedTextInContainer(container);
          });
          return;
        }
        var width = child.offsetWidth + ASPx.GetLeftRightMargins(child);
        if (textContainer) rightWidth += width;
        else leftWidth += width;
      }
    }
    if (textContainer && ASPx.IsTextWrapped(textContainer)) {
      var containerWidth =
        container.offsetWidth -
        ASPx.GetLeftRightBordersAndPaddingsSummaryValue(container);
      if (textContainer.shrinkedTextContainer) {
        Attr.RestoreStyleAttribute(textContainer, "width");
        Attr.ChangeStyleAttribute(container, "width", containerWidth + "px");
      }
      if (
        textContainer.offsetWidth + leftWidth + rightWidth >=
        containerWidth
      ) {
        if (rightWidth > 0 && !textContainer.shrinkedTextContainer)
          textContainer.style.width = containerWidth - rightWidth + "px";
        else if (leftWidth > 0) {
          if (ASPx.IsElementRightToLeft(container))
            textContainer.style.marginLeft = leftWidth + "px";
          else textContainer.style.marginRight = leftWidth + "px";
        }
      }
    }
  };
  ASPx.IsTextWrapped = function (element) {
    return element && ASPx.GetCurrentStyle(element).whiteSpace !== "nowrap";
  };
  ASPx.IsValidPosition = function (pos) {
    return pos != ASPx.InvalidPosition && pos != -ASPx.InvalidPosition;
  };
  ASPx.GetAbsoluteX = function (curEl) {
    return ASPx.GetAbsolutePositionX(curEl);
  };
  ASPx.GetAbsoluteY = function (curEl) {
    return ASPx.GetAbsolutePositionY(curEl);
  };
  ASPx.SetAbsoluteX = function (element, x) {
    element.style.left =
      ASPx.PrepareClientPosForElement(x, element, true) + "px";
  };
  ASPx.SetAbsoluteY = function (element, y) {
    element.style.top =
      ASPx.PrepareClientPosForElement(y, element, false) + "px";
  };
  ASPx.GetAbsolutePositionX = function (element) {
    if (Browser.IE) return getAbsolutePositionX_IE(element);
    else if (Browser.Firefox && Browser.Version >= 3)
      return getAbsolutePositionX_FF3(element);
    else if (Browser.Opera) return getAbsolutePositionX_Opera(element);
    else if (
      Browser.NetscapeFamily &&
      (!Browser.Firefox || Browser.Version < 3)
    )
      return getAbsolutePositionX_NS(element);
    else if (Browser.WebKitFamily || Browser.Edge)
      return getAbsolutePositionX_FF3(element);
    else return getAbsolutePositionX_Other(element);
  };
  function getAbsolutePositionX_Opera(curEl) {
    var isFirstCycle = true;
    var pos = getAbsoluteScrollOffset_OperaFF(curEl, true);
    while (curEl != null) {
      pos += curEl.offsetLeft;
      if (!isFirstCycle) pos -= curEl.scrollLeft;
      curEl = curEl.offsetParent;
      isFirstCycle = false;
    }
    pos += document.body.scrollLeft;
    return pos;
  }
  function getAbsolutePositionX_IE(element) {
    if (element == null || (Browser.IE && element.parentNode == null)) return 0;
    return element.getBoundingClientRect().left + ASPx.GetDocumentScrollLeft();
  }
  function getAbsolutePositionX_FF3(element) {
    if (element == null) return 0;
    var x = element.getBoundingClientRect().left + ASPx.GetDocumentScrollLeft();
    return Math.round(x);
  }
  function getAbsolutePositionX_NS(curEl) {
    var pos = getAbsoluteScrollOffset_OperaFF(curEl, true);
    var isFirstCycle = true;
    while (curEl != null) {
      pos += curEl.offsetLeft;
      if (!isFirstCycle && curEl.offsetParent != null) pos -= curEl.scrollLeft;
      if (!isFirstCycle && Browser.Firefox) {
        var style = ASPx.GetCurrentStyle(curEl);
        if (curEl.tagName == "DIV" && style.overflow != "visible")
          pos += ASPx.PxToInt(style.borderLeftWidth);
      }
      isFirstCycle = false;
      curEl = curEl.offsetParent;
    }
    return pos;
  }
  function getAbsolutePositionX_Safari(curEl) {
    var pos = getAbsoluteScrollOffset_WebKit(curEl, true);
    var isSafariVerNonLessThan3OrChrome =
      (Browser.Safari && Browser.Version >= 3) || Browser.Chrome;
    if (curEl != null) {
      var isFirstCycle = true;
      if (isSafariVerNonLessThan3OrChrome && curEl.tagName == "TD") {
        pos += curEl.offsetLeft;
        curEl = curEl.offsetParent;
        isFirstCycle = false;
      }
      var hasNonStaticElement = false;
      while (curEl != null) {
        pos += curEl.offsetLeft;
        var style = ASPx.GetCurrentStyle(curEl);
        var isNonStatic = style.position !== "" && style.position !== "static";
        if (isNonStatic) hasNonStaticElement = true;
        var safariDisplayTable =
          Browser.Safari && Browser.Version >= 8 && style.display === "table";
        var posDiv =
          curEl.tagName == "DIV" && isNonStatic && !safariDisplayTable;
        if (
          !isFirstCycle &&
          (curEl.tagName == "TD" || curEl.tagName == "TABLE" || posDiv)
        )
          pos += curEl.clientLeft;
        isFirstCycle = false;
        curEl = curEl.offsetParent;
      }
      if (
        !hasNonStaticElement &&
        (document.documentElement.style.position === "" ||
          document.documentElement.style.position === "static")
      )
        pos += document.documentElement.offsetLeft;
    }
    return pos;
  }
  function getAbsolutePositionX_Other(curEl) {
    var pos = 0;
    var isFirstCycle = true;
    while (curEl != null) {
      pos += curEl.offsetLeft;
      if (!isFirstCycle && curEl.offsetParent != null) pos -= curEl.scrollLeft;
      isFirstCycle = false;
      curEl = curEl.offsetParent;
    }
    return pos;
  }
  ASPx.GetAbsolutePositionY = function (element) {
    if (Browser.IE) return getAbsolutePositionY_IE(element);
    else if (Browser.Firefox && Browser.Version >= 3)
      return getAbsolutePositionY_FF3(element);
    else if (Browser.Opera) return getAbsolutePositionY_Opera(element);
    else if (
      Browser.NetscapeFamily &&
      (!Browser.Firefox || Browser.Version < 3)
    )
      return getAbsolutePositionY_NS(element);
    else if (Browser.WebKitFamily || Browser.Edge)
      return getAbsolutePositionY_FF3(element);
    else return getAbsolutePositionY_Other(element);
  };
  function getAbsolutePositionY_Opera(curEl) {
    var isFirstCycle = true;
    if (curEl && curEl.tagName == "TR" && curEl.cells.length > 0)
      curEl = curEl.cells[0];
    var pos = getAbsoluteScrollOffset_OperaFF(curEl, false);
    while (curEl != null) {
      pos += curEl.offsetTop;
      if (!isFirstCycle) pos -= curEl.scrollTop;
      curEl = curEl.offsetParent;
      isFirstCycle = false;
    }
    pos += document.body.scrollTop;
    return pos;
  }
  function getAbsolutePositionY_IE(element) {
    if (element == null || (Browser.IE && element.parentNode == null)) return 0;
    return element.getBoundingClientRect().top + ASPx.GetDocumentScrollTop();
  }
  function getAbsolutePositionY_FF3(element) {
    if (element == null) return 0;
    var y = element.getBoundingClientRect().top + ASPx.GetDocumentScrollTop();
    return Math.round(y);
  }
  function getAbsolutePositionY_NS(curEl) {
    var pos = getAbsoluteScrollOffset_OperaFF(curEl, false);
    var isFirstCycle = true;
    while (curEl != null) {
      pos += curEl.offsetTop;
      if (!isFirstCycle && curEl.offsetParent != null) pos -= curEl.scrollTop;
      if (!isFirstCycle && Browser.Firefox) {
        var style = ASPx.GetCurrentStyle(curEl);
        if (curEl.tagName == "DIV" && style.overflow != "visible")
          pos += ASPx.PxToInt(style.borderTopWidth);
      }
      isFirstCycle = false;
      curEl = curEl.offsetParent;
    }
    return pos;
  }
  var WebKit3TDRealInfo = {
    GetOffsetTop: function (tdElement) {
      switch (ASPx.GetCurrentStyle(tdElement).verticalAlign) {
        case "middle":
          return Math.round(
            tdElement.offsetTop -
              (tdElement.offsetHeight - tdElement.clientHeight) / 2 +
              tdElement.clientTop
          );
        case "bottom":
          return (
            tdElement.offsetTop -
            tdElement.offsetHeight +
            tdElement.clientHeight +
            tdElement.clientTop
          );
      }
      return tdElement.offsetTop;
    },
    GetClientHeight: function (tdElement) {
      var valign = ASPx.GetCurrentStyle(tdElement).verticalAlign;
      switch (valign) {
        case "middle":
          return tdElement.clientHeight + tdElement.offsetTop * 2;
        case "top":
          return tdElement.offsetHeight - tdElement.clientTop * 2;
        case "bottom":
          return tdElement.clientHeight + tdElement.offsetTop;
      }
      return tdElement.clientHeight;
    },
  };
  function getAbsolutePositionY_Safari(curEl) {
    var pos = getAbsoluteScrollOffset_WebKit(curEl, false);
    var isSafariVerNonLessThan3OrChrome =
      (Browser.Safari && Browser.Version >= 3) || Browser.Chrome;
    if (curEl != null) {
      var isFirstCycle = true;
      if (isSafariVerNonLessThan3OrChrome && curEl.tagName == "TD") {
        pos += WebKit3TDRealInfo.GetOffsetTop(curEl);
        curEl = curEl.offsetParent;
        isFirstCycle = false;
      }
      var hasNonStaticElement = false;
      while (curEl != null) {
        pos += curEl.offsetTop;
        var style = ASPx.GetCurrentStyle(curEl);
        var isNonStatic = style.position !== "" && style.position !== "static";
        if (isNonStatic) hasNonStaticElement = true;
        var safariDisplayTable =
          Browser.Safari && Browser.Version >= 8 && style.display === "table";
        var posDiv =
          curEl.tagName == "DIV" && isNonStatic && !safariDisplayTable;
        if (
          !isFirstCycle &&
          (curEl.tagName == "TD" || curEl.tagName == "TABLE" || posDiv)
        )
          pos += curEl.clientTop;
        isFirstCycle = false;
        curEl = curEl.offsetParent;
      }
      if (
        !hasNonStaticElement &&
        (document.documentElement.style.position === "" ||
          document.documentElement.style.position === "static")
      )
        pos += document.documentElement.offsetTop;
    }
    return pos;
  }
  function getAbsoluteScrollOffset_OperaFF(curEl, isX) {
    var pos = 0;
    var isFirstCycle = true;
    while (curEl != null) {
      if (curEl.tagName == "BODY") break;
      var style = ASPx.GetCurrentStyle(curEl);
      if (style.position == "absolute") break;
      if (
        !isFirstCycle &&
        curEl.tagName == "DIV" &&
        (style.position == "" || style.position == "static")
      )
        pos -= isX ? curEl.scrollLeft : curEl.scrollTop;
      curEl = curEl.parentNode;
      isFirstCycle = false;
    }
    return pos;
  }
  function getAbsoluteScrollOffset_WebKit(curEl, isX) {
    var pos = 0;
    var isFirstCycle = true;
    var step = 0;
    var absoluteWasFoundAtStep = -1;
    var isThereFixedParent = false;
    while (curEl != null) {
      if (curEl.tagName == "BODY") break;
      var style = ASPx.GetCurrentStyle(curEl);
      var positionIsDefault =
        style.position == "" || style.position == "static";
      var absoluteWasFoundAtPreviousStep =
        absoluteWasFoundAtStep >= 0 && absoluteWasFoundAtStep < step;
      var canHaveScrolls =
        curEl.tagName == "DIV" ||
        curEl.tagName == "SECTION" ||
        curEl.tagName == "FORM";
      if (
        !isFirstCycle &&
        canHaveScrolls &&
        (!positionIsDefault || !absoluteWasFoundAtPreviousStep)
      )
        pos -= isX ? curEl.scrollLeft : curEl.scrollTop;
      if (style.position == "absolute") absoluteWasFoundAtStep = step;
      else if (style.position == "relative") absoluteWasFoundAtStep = -1;
      else if (style.position == "fixed") isThereFixedParent = true;
      curEl = curEl.parentNode;
      isFirstCycle = false;
      step++;
    }
    if (isThereFixedParent)
      pos += isX ? ASPx.GetDocumentScrollLeft() : ASPx.GetDocumentScrollTop();
    return pos;
  }
  function getAbsolutePositionY_Other(curEl) {
    var pos = 0;
    var isFirstCycle = true;
    while (curEl != null) {
      pos += curEl.offsetTop;
      if (!isFirstCycle && curEl.offsetParent != null) pos -= curEl.scrollTop;
      isFirstCycle = false;
      curEl = curEl.offsetParent;
    }
    return pos;
  }
  function createElementMock(element) {
    var div = document.createElement("DIV");
    div.style.top = "0px";
    div.style.left = "0px";
    div.visibility = "hidden";
    div.style.position = ASPx.GetCurrentStyle(element).position;
    return div;
  }
  ASPx.PrepareClientPosElementForOtherParent = function (
    pos,
    element,
    otherParent,
    isX
  ) {
    if (element.parentNode == otherParent)
      return ASPx.PrepareClientPosForElement(pos, element, isX);
    var elementMock = createElementMock(element);
    otherParent.appendChild(elementMock);
    var preparedPos = ASPx.PrepareClientPosForElement(pos, elementMock, isX);
    otherParent.removeChild(elementMock);
    return preparedPos;
  };
  ASPx.PrepareClientPosForElement = function (pos, element, isX) {
    pos -= ASPx.GetPositionElementOffset(element, isX);
    return pos;
  };
  function getExperimentalPositionOffset(element, isX) {
    var div = createElementMock(element);
    if (div.style.position == "static") div.style.position = "absolute";
    element.parentNode.appendChild(div);
    var realPos = isX ? ASPx.GetAbsoluteX(div) : ASPx.GetAbsoluteY(div);
    element.parentNode.removeChild(div);
    return Math.round(realPos);
  }
  ASPx.GetPositionElementOffset = function (element, isX) {
    return getExperimentalPositionOffset(element, isX);
  };
  function getPositionElementOffsetCore(element, isX) {
    var curEl = element.offsetParent;
    var offset = 0;
    var scroll = 0;
    var isThereFixedParent = false;
    var isFixed = false;
    var hasDisplayTableParent = false;
    var position = "";
    while (curEl != null) {
      var tagName = curEl.tagName;
      if (tagName == "HTML") {
        break;
      }
      if (tagName == "BODY") {
        if (!Browser.Opera && !Browser.Chrome && !Browser.Edge) {
          var style = ASPx.GetCurrentStyle(curEl);
          if (style.position != "" && style.position != "static") {
            offset += ASPx.PxToInt(isX ? style.left : style.top);
            offset += ASPx.PxToInt(isX ? style.marginLeft : style.marginTop);
          }
        }
        break;
      }
      var style = ASPx.GetCurrentStyle(curEl);
      isFixed = style.position == "fixed";
      if (isFixed) {
        isThereFixedParent = true;
        if (Browser.IE) return getExperimentalPositionOffset(element, isX);
      }
      hasDisplayTableParent =
        style.display == "table" &&
        (style.position == "absolute" || style.position == "relative");
      if (hasDisplayTableParent && Browser.IE)
        return getExperimentalPositionOffset(element, isX);
      if (
        style.position == "absolute" ||
        isFixed ||
        style.position == "relative"
      ) {
        offset += isX ? curEl.offsetLeft : curEl.offsetTop;
        offset += ASPx.PxToInt(
          isX ? style.borderLeftWidth : style.borderTopWidth
        );
      }
      if (style.position == "relative")
        scroll += getElementChainScroll(curEl, curEl.offsetParent, isX);
      scroll += isX ? curEl.scrollLeft : curEl.scrollTop;
      curEl = curEl.offsetParent;
    }
    offset -= scroll;
    if (
      (Browser.IE ||
        (Browser.Firefox && Browser.Version >= 3) ||
        Browser.WebKitFamily ||
        Browser.Edge) &&
      isThereFixedParent
    )
      offset += isX
        ? ASPx.GetDocumentScrollLeft()
        : ASPx.GetDocumentScrollTop();
    return offset;
  }
  function getElementChainScroll(startElement, endElement, isX) {
    var curEl = startElement.parentNode;
    var scroll = 0;
    while (curEl != endElement) {
      scroll += isX ? curEl.scrollLeft : curEl.scrollTop;
      curEl = curEl.parentNode;
    }
    return scroll;
  }
  ASPx.GetSizeOfText = function (text, textCss) {
    var testContainer = document.createElement("tester");
    var defaultLineHeight = ASPx.Browser.Firefox ? "1" : "";
    testContainer.style.fontSize = textCss.fontSize;
    testContainer.style.fontFamily = textCss.fontFamily;
    testContainer.style.fontWeight = textCss.fontWeight;
    testContainer.style.letterSpacing = textCss.letterSpacing;
    testContainer.style.lineHeight = textCss.lineHeight || defaultLineHeight;
    testContainer.style.position = "absolute";
    testContainer.style.top = ASPx.InvalidPosition + "px";
    testContainer.style.left = ASPx.InvalidPosition + "px";
    testContainer.style.width = "auto";
    testContainer.style.whiteSpace = "nowrap";
    testContainer.appendChild(document.createTextNode(text));
    var testElement = document.body.appendChild(testContainer);
    var size = {
      width: testElement.offsetWidth,
      height: testElement.offsetHeight,
    };
    document.body.removeChild(testElement);
    return size;
  };
  ASPx.PointToPixel = function (points, addPx) {
    var result = 0;
    try {
      var indexOfPt = points.toLowerCase().indexOf("pt");
      if (indexOfPt > -1)
        result = (parseInt(points.substr(0, indexOfPt)) * 96) / 72;
      else result = (parseInt(points) * 96) / 72;
      if (addPx) result = result + "px";
    } catch (e) {}
    return result;
  };
  ASPx.PixelToPoint = function (pixels, addPt) {
    var result = 0;
    try {
      var indexOfPx = pixels.toLowerCase().indexOf("px");
      if (indexOfPx > -1)
        result = (parseInt(pixels.substr(0, indexOfPx)) * 72) / 96;
      else result = (parseInt(pixels) * 72) / 96;
      if (addPt) result = result + "pt";
    } catch (e) {}
    return result;
  };
  ASPx.PxToInt = function (px) {
    return pxToNumber(px, parseInt);
  };
  ASPx.PxToFloat = function (px) {
    return pxToNumber(px, parseFloat);
  };
  function pxToNumber(px, parseFunction) {
    var result = 0;
    if (px != null && px != "") {
      try {
        var indexOfPx = px.indexOf("px");
        if (indexOfPx > -1) result = parseFunction(px.substr(0, indexOfPx));
      } catch (e) {}
    }
    return result;
  }
  ASPx.PercentageToFloat = function (perc) {
    var result = 0;
    if (perc != null && perc != "") {
      try {
        var indexOfPerc = perc.indexOf("%");
        if (indexOfPerc > -1)
          result = parseFloat(perc.substr(0, indexOfPerc)) / 100;
      } catch (e) {}
    }
    return result;
  };
  ASPx.CreateGuid = function () {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };
  ASPx.GetLeftRightBordersAndPaddingsSummaryValue = function (
    element,
    currentStyle
  ) {
    return (
      ASPx.GetLeftRightPaddings(element, currentStyle) +
      ASPx.GetHorizontalBordersWidth(element, currentStyle)
    );
  };
  ASPx.GetTopBottomBordersAndPaddingsSummaryValue = function (
    element,
    currentStyle
  ) {
    return (
      ASPx.GetTopBottomPaddings(element, currentStyle) +
      ASPx.GetVerticalBordersWidth(element, currentStyle)
    );
  };
  ASPx.GetVerticalBordersWidth = function (element, style) {
    if (!ASPx.IsExists(style))
      style =
        Browser.IE && Browser.MajorVersion != 9 && window.getComputedStyle
          ? window.getComputedStyle(element)
          : ASPx.GetCurrentStyle(element);
    var res = 0;
    if (style.borderTopStyle != "none") {
      res += ASPx.PxToFloat(style.borderTopWidth);
      if (Browser.IE && Browser.MajorVersion < 9)
        res += getIe8BorderWidthFromText(style.borderTopWidth);
    }
    if (style.borderBottomStyle != "none") {
      res += ASPx.PxToFloat(style.borderBottomWidth);
      if (Browser.IE && Browser.MajorVersion < 9)
        res += getIe8BorderWidthFromText(style.borderBottomWidth);
    }
    return res;
  };
  ASPx.GetHorizontalBordersWidth = function (element, style) {
    if (!ASPx.IsExists(style))
      style =
        Browser.IE && window.getComputedStyle
          ? window.getComputedStyle(element)
          : ASPx.GetCurrentStyle(element);
    var res = 0;
    if (style.borderLeftStyle != "none") {
      res += ASPx.PxToFloat(style.borderLeftWidth);
      if (Browser.IE && Browser.MajorVersion < 9)
        res += getIe8BorderWidthFromText(style.borderLeftWidth);
    }
    if (style.borderRightStyle != "none") {
      res += ASPx.PxToFloat(style.borderRightWidth);
      if (Browser.IE && Browser.MajorVersion < 9)
        res += getIe8BorderWidthFromText(style.borderRightWidth);
    }
    return res;
  };
  function getIe8BorderWidthFromText(textWidth) {
    var availableWidth = { thin: 1, medium: 3, thick: 5 };
    var width = availableWidth[textWidth];
    return width ? width : 0;
  }
  ASPx.GetTopBottomPaddings = function (element, style) {
    var currentStyle = style ? style : ASPx.GetCurrentStyle(element);
    return (
      ASPx.PxToInt(currentStyle.paddingTop) +
      ASPx.PxToInt(currentStyle.paddingBottom)
    );
  };
  ASPx.GetLeftRightPaddings = function (element, style) {
    var currentStyle = style ? style : ASPx.GetCurrentStyle(element);
    return (
      ASPx.PxToInt(currentStyle.paddingLeft) +
      ASPx.PxToInt(currentStyle.paddingRight)
    );
  };
  ASPx.GetTopBottomMargins = function (element, style) {
    var currentStyle = style ? style : ASPx.GetCurrentStyle(element);
    return (
      ASPx.PxToInt(currentStyle.marginTop) +
      ASPx.PxToInt(currentStyle.marginBottom)
    );
  };
  ASPx.GetLeftRightMargins = function (element, style) {
    var currentStyle = style ? style : ASPx.GetCurrentStyle(element);
    return (
      ASPx.PxToInt(currentStyle.marginLeft) +
      ASPx.PxToInt(currentStyle.marginRight)
    );
  };
  ASPx.GetClearClientWidth = function (element) {
    return (
      element.offsetWidth -
      ASPx.GetLeftRightBordersAndPaddingsSummaryValue(element)
    );
  };
  ASPx.GetClearClientHeight = function (element) {
    return (
      element.offsetHeight -
      ASPx.GetTopBottomBordersAndPaddingsSummaryValue(element)
    );
  };
  ASPx.SetOffsetWidth = function (element, widthValue, currentStyle) {
    if (!ASPx.IsExists(currentStyle))
      currentStyle = ASPx.GetCurrentStyle(element);
    var value =
      widthValue -
      ASPx.PxToInt(currentStyle.marginLeft) -
      ASPx.PxToInt(currentStyle.marginRight);
    value -= ASPx.GetLeftRightBordersAndPaddingsSummaryValue(
      element,
      currentStyle
    );
    if (value > -1) element.style.width = value + "px";
  };
  ASPx.SetOffsetHeight = function (element, heightValue, currentStyle) {
    if (!ASPx.IsExists(currentStyle))
      currentStyle = ASPx.GetCurrentStyle(element);
    var value =
      heightValue -
      ASPx.PxToInt(currentStyle.marginTop) -
      ASPx.PxToInt(currentStyle.marginBottom);
    value -= ASPx.GetTopBottomBordersAndPaddingsSummaryValue(
      element,
      currentStyle
    );
    if (value > -1) element.style.height = value + "px";
  };
  ASPx.FindOffsetParent = function (element) {
    var currentElement = element.parentNode;
    while (
      ASPx.IsExistsElement(currentElement) &&
      currentElement.tagName != "BODY"
    ) {
      if (currentElement.offsetWidth > 0 && currentElement.offsetHeight > 0)
        return currentElement;
      currentElement = currentElement.parentNode;
    }
    return document.body;
  };
  ASPx.GetDocumentScrollTop = function () {
    var isScrollBodyIE =
      Browser.IE &&
      ASPx.GetCurrentStyle(document.body).overflow == "hidden" &&
      document.body.scrollTop > 0;
    if (Browser.WebKitFamily || Browser.Edge || isScrollBodyIE) {
      if (Browser.MacOSMobilePlatform) return window.pageYOffset;
      else return document.body.scrollTop;
    } else return document.documentElement.scrollTop;
  };
  ASPx.SetDocumentScrollTop = function (scrollTop) {
    if (Browser.WebKitFamily || Browser.Edge) {
      if (Browser.MacOSMobilePlatform) window.pageYOffset = scrollTop;
      else document.body.scrollTop = scrollTop;
    } else document.documentElement.scrollTop = scrollTop;
  };
  ASPx.GetDocumentScrollLeft = function () {
    var isScrollBodyIE =
      Browser.IE &&
      ASPx.GetCurrentStyle(document.body).overflow == "hidden" &&
      document.body.scrollLeft > 0;
    if (Browser.WebKitFamily || Browser.Edge || isScrollBodyIE)
      return document.body.scrollLeft;
    return document.documentElement.scrollLeft;
  };
  ASPx.SetDocumentScrollLeft = function (scrollLeft) {
    if (Browser.WebKitFamily || Browser.Edge) {
      if (Browser.MacOSMobilePlatform) window.pageXOffset = scrollLeft;
      else document.body.scrollLeft = scrollLeft;
    } else document.documentElement.scrollLeft = scrollLeft;
  };
  ASPx.GetDocumentClientWidth = function () {
    if (document.documentElement.clientWidth == 0)
      return document.body.clientWidth;
    else return document.documentElement.clientWidth;
  };
  ASPx.GetDocumentClientHeight = function () {
    if (
      Browser.Firefox &&
      window.innerHeight - document.documentElement.clientHeight >
        ASPx.GetVerticalScrollBarWidth()
    ) {
      return window.innerHeight;
    } else if (
      (Browser.Opera && Browser.Version < 9.6) ||
      document.documentElement.clientHeight == 0
    ) {
      return document.body.clientHeight;
    }
    return document.documentElement.clientHeight;
  };
  ASPx.GetDocumentWidth = function () {
    var bodyWidth = document.body.offsetWidth;
    var docWidth = Browser.IE
      ? document.documentElement.clientWidth
      : document.documentElement.offsetWidth;
    var bodyScrollWidth = document.body.scrollWidth;
    var docScrollWidth = document.documentElement.scrollWidth;
    return getMaxDimensionOf(
      bodyWidth,
      docWidth,
      bodyScrollWidth,
      docScrollWidth
    );
  };
  ASPx.GetDocumentHeight = function () {
    var bodyHeight = document.body.offsetHeight;
    var docHeight = Browser.IE
      ? document.documentElement.clientHeight
      : document.documentElement.offsetHeight;
    var bodyScrollHeight = document.body.scrollHeight;
    var docScrollHeight = document.documentElement.scrollHeight;
    var maxHeight = getMaxDimensionOf(
      bodyHeight,
      docHeight,
      bodyScrollHeight,
      docScrollHeight
    );
    if (Browser.Opera && Browser.Version >= 9.6) {
      if (Browser.Version < 10)
        maxHeight = getMaxDimensionOf(bodyHeight, docHeight, bodyScrollHeight);
      var visibleHeightOfDocument = document.documentElement.clientHeight;
      if (maxHeight > visibleHeightOfDocument)
        maxHeight = getMaxDimensionOf(window.outerHeight, maxHeight);
      else maxHeight = document.documentElement.clientHeight;
      return maxHeight;
    }
    return maxHeight;
  };
  ASPx.GetDocumentMaxClientWidth = function () {
    var bodyWidth = document.body.offsetWidth;
    var docWidth = document.documentElement.offsetWidth;
    var docClientWidth = document.documentElement.clientWidth;
    return getMaxDimensionOf(bodyWidth, docWidth, docClientWidth);
  };
  ASPx.GetDocumentMaxClientHeight = function () {
    var bodyHeight = document.body.offsetHeight;
    var docHeight = document.documentElement.offsetHeight;
    var docClientHeight = document.documentElement.clientHeight;
    return getMaxDimensionOf(bodyHeight, docHeight, docClientHeight);
  };
  ASPx.verticalScrollIsNotHidden = null;
  ASPx.horizontalScrollIsNotHidden = null;
  ASPx.GetVerticalScrollIsNotHidden = function () {
    if (!ASPx.IsExists(ASPx.verticalScrollIsNotHidden))
      ASPx.verticalScrollIsNotHidden =
        ASPx.GetCurrentStyle(document.body).overflowY !== "hidden" &&
        ASPx.GetCurrentStyle(document.documentElement).overflowY !== "hidden";
    return ASPx.verticalScrollIsNotHidden;
  };
  ASPx.GetHorizontalScrollIsNotHidden = function () {
    if (!ASPx.IsExists(ASPx.horizontalScrollIsNotHidden))
      ASPx.horizontalScrollIsNotHidden =
        ASPx.GetCurrentStyle(document.body).overflowX !== "hidden" &&
        ASPx.GetCurrentStyle(document.documentElement).overflowX !== "hidden";
    return ASPx.horizontalScrollIsNotHidden;
  };
  ASPx.GetCurrentDocumentWidth = function () {
    var result = ASPx.GetDocumentClientWidth();
    if (
      !ASPx.Browser.Safari &&
      ASPx.GetVerticalScrollIsNotHidden() &&
      ASPx.GetDocumentHeight() > ASPx.GetDocumentClientHeight()
    )
      result += ASPx.GetVerticalScrollBarWidth();
    return result;
  };
  ASPx.GetCurrentDocumentHeight = function () {
    var result = ASPx.GetDocumentClientHeight();
    if (
      !ASPx.Browser.Safari &&
      ASPx.GetHorizontalScrollIsNotHidden() &&
      ASPx.GetDocumentWidth() > ASPx.GetDocumentClientWidth()
    )
      result += ASPx.GetVerticalScrollBarWidth();
    return result;
  };
  function getMaxDimensionOf() {
    var max = ASPx.InvalidDimension;
    for (var i = 0; i < arguments.length; i++) {
      if (max < arguments[i]) max = arguments[i];
    }
    return max;
  }
  ASPx.GetClientLeft = function (element) {
    return ASPx.IsExists(element.clientLeft)
      ? element.clientLeft
      : (element.offsetWidth - element.clientWidth) / 2;
  };
  ASPx.GetClientTop = function (element) {
    return ASPx.IsExists(element.clientTop)
      ? element.clientTop
      : (element.offsetHeight - element.clientHeight) / 2;
  };
  ASPx.SetStyles = function (element, styles, makeImportant) {
    if (ASPx.IsExists(styles.cssText)) element.style.cssText = styles.cssText;
    if (ASPx.IsExists(styles.className)) element.className = styles.className;
    for (var property in styles) {
      if (!styles.hasOwnProperty(property)) continue;
      var value = styles[property];
      switch (property) {
        case "cssText":
        case "className":
          break;
        case "float":
          ASPx.SetElementFloat(element, value);
          break;
        case "opacity":
          ASPx.SetElementOpacity(element, value);
          break;
        case "zIndex":
          ASPx.SetStylesCore(element, property, value, makeImportant);
          break;
        case "fontWeight":
          if (
            ASPx.Browser.IE &&
            ASPx.Browser.Version < 9 &&
            typeof styles[property] == "number"
          )
            value = styles[property].toString();
        default:
          ASPx.SetStylesCore(
            element,
            property,
            value + (typeof value == "number" ? "px" : ""),
            makeImportant
          );
      }
    }
  };
  ASPx.SetStylesCore = function (element, property, value, makeImportant) {
    if (makeImportant) {
      var index = property.search("[A-Z]");
      if (index != -1)
        property = property.replace(
          property.charAt(index),
          "-" + property.charAt(index).toLowerCase()
        );
      if (element.style.setProperty)
        element.style.setProperty(property, value, "important");
      else element.style.cssText += ";" + property + ":" + value + "!important";
    } else element.style[property] = value;
  };
  ASPx.RemoveBordersAndShadows = function (el) {
    if (!el || !el.style) return;
    el.style.borderWidth = 0;
    if (ASPx.IsExists(el.style.boxShadow)) el.style.boxShadow = "none";
    else if (ASPx.IsExists(el.style.MozBoxShadow))
      el.style.MozBoxShadow = "none";
    else if (ASPx.IsExists(el.style.webkitBoxShadow))
      el.style.webkitBoxShadow = "none";
  };
  ASPx.GetCellSpacing = function (element) {
    var val = parseInt(element.cellSpacing);
    if (!isNaN(val)) return val;
    val = parseInt(ASPx.GetCurrentStyle(element).borderSpacing);
    if (!isNaN(val)) return val;
    return 0;
  };
  ASPx.GetInnerScrollPositions = function (element) {
    var scrolls = [];
    getInnerScrollPositionsCore(element, scrolls);
    return scrolls;
  };
  function getInnerScrollPositionsCore(element, scrolls) {
    for (var child = element.firstChild; child; child = child.nextSibling) {
      var scrollTop = child.scrollTop,
        scrollLeft = child.scrollLeft;
      if (scrollTop > 0 || scrollLeft > 0)
        scrolls.push([child, scrollTop, scrollLeft]);
      getInnerScrollPositionsCore(child, scrolls);
    }
  }
  ASPx.RestoreInnerScrollPositions = function (scrolls) {
    for (var i = 0, scrollArr; (scrollArr = scrolls[i]); i++) {
      if (scrollArr[1] > 0) scrollArr[0].scrollTop = scrollArr[1];
      if (scrollArr[2] > 0) scrollArr[0].scrollLeft = scrollArr[2];
    }
  };
  ASPx.GetOuterScrollPosition = function (element) {
    while (element.tagName !== "BODY") {
      var scrollTop = element.scrollTop,
        scrollLeft = element.scrollLeft;
      if (scrollTop > 0 || scrollLeft > 0) {
        return {
          scrollTop: scrollTop,
          scrollLeft: scrollLeft,
          element: element,
        };
      }
      element = element.parentNode;
    }
    return {
      scrollTop: ASPx.GetDocumentScrollTop(),
      scrollLeft: ASPx.GetDocumentScrollLeft(),
    };
  };
  ASPx.RestoreOuterScrollPosition = function (scrollInfo) {
    if (scrollInfo.element) {
      if (scrollInfo.scrollTop > 0)
        scrollInfo.element.scrollTop = scrollInfo.scrollTop;
      if (scrollInfo.scrollLeft > 0)
        scrollInfo.element.scrollLeft = scrollInfo.scrollLeft;
    } else {
      if (scrollInfo.scrollTop > 0)
        ASPx.SetDocumentScrollTop(scrollInfo.scrollTop);
      if (scrollInfo.scrollLeft > 0)
        ASPx.SetDocumentScrollLeft(scrollInfo.scrollLeft);
    }
  };
  ASPx.ChangeElementContainer = function (
    element,
    container,
    savePreviousContainer
  ) {
    if (element.parentNode != container) {
      var parentNode = element.parentNode;
      parentNode.removeChild(element);
      container.appendChild(element);
      if (savePreviousContainer) element.previousContainer = parentNode;
    }
  };
  ASPx.RestoreElementContainer = function (element) {
    if (element.previousContainer) {
      ASPx.ChangeElementContainer(element, element.previousContainer, false);
      element.previousContainer = null;
    }
  };
  ASPx.MoveChildrenToElement = function (sourceElement, destinationElement) {
    while (sourceElement.childNodes.length > 0)
      destinationElement.appendChild(sourceElement.childNodes[0]);
  };
  ASPx.GetScriptCode = function (script) {
    var useFirstChildElement =
      (Browser.Chrome && Browser.Version < 11) ||
      (Browser.Safari && Browser.Version < 5);
    var text = useFirstChildElement ? script.firstChild.data : script.text;
    var comment = "<!--";
    var pos = text.indexOf(comment);
    if (pos > -1) text = text.substr(pos + comment.length);
    return text;
  };
  ASPx.AppendScript = function (script) {
    var parent = document.getElementsByTagName("head")[0];
    if (!parent) parent = document.body;
    if (parent) parent.appendChild(script);
  };
  function getFrame(frames, name) {
    if (frames[name]) return frames[name];
    for (var i = 0; i < frames.length; i++) {
      try {
        var frame = frames[i];
        if (frame.name == name) return frame;
        frame = getFrame(frame.frames, name);
        if (frame != null) return frame;
      } catch (e) {}
    }
    return null;
  }
  ASPx.IsValidElement = function (element) {
    if (!element) return false;
    if (!(Browser.Firefox && Browser.Version < 4)) {
      if (
        element.ownerDocument &&
        element.ownerDocument.body.compareDocumentPosition
      )
        return (
          element.ownerDocument.body.compareDocumentPosition(element) % 2 === 0
        );
    }
    if (
      !Browser.Opera &&
      !(Browser.IE && Browser.Version < 9) &&
      element.offsetParent &&
      element.parentNode.tagName
    )
      return true;
    while (element != null) {
      if (element.tagName == "BODY") return true;
      element = element.parentNode;
    }
    return false;
  };
  ASPx.IsValidElements = function (elements) {
    if (!elements) return false;
    for (var i = 0; i < elements.length; i++) {
      if (elements[i] && !ASPx.IsValidElement(elements[i])) return false;
    }
    return true;
  };
  ASPx.IsExistsElement = function (element) {
    return element && ASPx.IsValidElement(element);
  };
  ASPx.CreateHtmlElementFromString = function (str) {
    var dummy = ASPx.CreateHtmlElement();
    dummy.innerHTML = str;
    return dummy.firstChild;
  };
  ASPx.CreateHtmlElement = function (tagName, styles) {
    var element = document.createElement(tagName || "DIV");
    if (styles) ASPx.SetStyles(element, styles);
    return element;
  };
  ASPx.RestoreElementOriginalWidth = function (element) {
    if (!ASPx.IsExistsElement(element)) return;
    element.style.width = element.dxOrigWidth =
      ASPx.GetElementOriginalWidth(element);
  };
  ASPx.GetElementOriginalWidth = function (element) {
    if (!ASPx.IsExistsElement(element)) return null;
    var width;
    if (!ASPx.IsExists(element.dxOrigWidth)) {
      width =
        String(element.style.width).length > 0
          ? element.style.width
          : element.offsetWidth + "px";
    } else {
      width = element.dxOrigWidth;
    }
    return width;
  };
  ASPx.DropElementOriginalWidth = function (element) {
    if (ASPx.IsExists(element.dxOrigWidth)) element.dxOrigWidth = null;
  };
  ASPx.GetObjectKeys = function (obj) {
    if (!obj) return [];
    if (Object.keys) return Object.keys(obj);
    var keys = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) keys.push(key);
    }
    return keys;
  };
  ASPx.IsInteractiveControl = function (element, extremeParent) {
    return (
      Data.ArrayIndexOf(
        ["A", "INPUT", "SELECT", "OPTION", "TEXTAREA", "BUTTON", "IFRAME"],
        element.tagName
      ) > -1
    );
  };
  ASPx.IsUrlContainsClientScript = function (url) {
    return url.toLowerCase().indexOf("javascript:") !== -1;
  };
  Function.prototype.aspxBind = function (scope) {
    var func = this;
    return function () {
      return func.apply(scope, arguments);
    };
  };
  var FilteringUtils = {};
  FilteringUtils.EventKeyCodeChangesTheInput = function (evt) {
    if (ASPx.IsPasteShortcut(evt)) return true;
    else if (evt.ctrlKey && !evt.altKey) return false;
    if (ASPx.Browser.AndroidMobilePlatform || ASPx.Browser.MacOSMobilePlatform)
      return true;
    var keyCode = ASPx.Evt.GetKeyCode(evt);
    var isSystemKey =
      ASPx.Key.Windows <= keyCode && keyCode <= ASPx.Key.ContextMenu;
    var isFKey = ASPx.Key.F1 <= keyCode && keyCode <= 127;
    return (
      (ASPx.Key.Delete <= keyCode && !isSystemKey && !isFKey) ||
      keyCode == ASPx.Key.Backspace ||
      keyCode == ASPx.Key.Space
    );
  };
  FilteringUtils.FormatCallbackArg = function (prefix, arg) {
    return ASPx.IsExists(arg)
      ? prefix + "|" + arg.length + ";" + arg + ";"
      : "";
  };
  ASPx.FilteringUtils = FilteringUtils;
  var FormatStringHelper = {};
  FormatStringHelper.PlaceHolderTemplateStruct = function (
    startIndex,
    length,
    index,
    placeHolderString
  ) {
    this.startIndex = startIndex;
    this.realStartIndex = 0;
    this.length = length;
    this.realLength = 0;
    this.index = index;
    this.placeHolderString = placeHolderString;
  };
  FormatStringHelper.GetPlaceHolderTemplates = function (formatString) {
    formatString = this.CollapseDoubleBrackets(formatString);
    var templates = this.CreatePlaceHolderTemplates(formatString);
    return templates;
  };
  FormatStringHelper.CreatePlaceHolderTemplates = function (formatString) {
    var templates = [];
    var templateStrings = formatString.match(/{[^}]+}/g);
    if (templateStrings != null) {
      var pos = 0;
      for (var i = 0; i < templateStrings.length; i++) {
        var tempString = templateStrings[i];
        var startIndex = formatString.indexOf(tempString, pos);
        var length = tempString.length;
        var indexString = tempString.slice(1).match(/^[0-9]+/);
        var index = parseInt(indexString);
        templates.push(
          new this.PlaceHolderTemplateStruct(
            startIndex,
            length,
            index,
            tempString
          )
        );
        pos = startIndex + length;
      }
    }
    return templates;
  };
  FormatStringHelper.CollapseDoubleBrackets = function (formatString) {
    formatString = this.CollapseOpenDoubleBrackets(formatString);
    formatString = this.CollapseCloseDoubleBrackets(formatString);
    return formatString;
  };
  FormatStringHelper.CollapseOpenDoubleBrackets = function (formatString) {
    return formatString.replace(/{{/g, "_");
  };
  FormatStringHelper.CollapseCloseDoubleBrackets = function (formatString) {
    while (true) {
      var index = formatString.lastIndexOf("}}");
      if (index == -1) break;
      else
        formatString =
          formatString.substr(0, index) + "_" + formatString.substr(index + 2);
    }
    return formatString;
  };
  ASPx.FormatStringHelper = FormatStringHelper;
  var StartWithFilteringUtils = {};
  StartWithFilteringUtils.HighlightSuggestedText = function (
    input,
    suggestedText,
    control
  ) {
    if (this.NeedToLockAndoidKeyEvents(control)) control.LockAndroidKeyEvents();
    var selInfo = ASPx.Selection.GetInfo(input);
    var currentTextLenght = ASPx.Str.GetCoincideCharCount(
      suggestedText,
      input.value,
      function (text, filter) {
        return text.indexOf(filter) == 0;
      }
    );
    var suggestedTextLenght = suggestedText.length;
    var isSelected =
      selInfo.startPos == 0 &&
      selInfo.endPos == currentTextLenght &&
      selInfo.endPos == suggestedTextLenght &&
      input.value == suggestedText;
    if (!isSelected) {
      input.value = suggestedText;
      if (this.NeedToLockAndoidKeyEvents(control)) {
        window.setTimeout(
          function () {
            this.SelectText(input, currentTextLenght, suggestedTextLenght);
            control.UnlockAndroidKeyEvents();
          }.aspxBind(this),
          control.adroidSamsungBugTimeout
        );
      } else this.SelectText(input, currentTextLenght, suggestedTextLenght);
    }
  };
  StartWithFilteringUtils.SelectText = function (input, startPos, stopPos) {
    if (startPos < stopPos) ASPx.Selection.Set(input, startPos, stopPos);
  };
  StartWithFilteringUtils.RollbackOneSuggestedChar = function (input) {
    var currentText = input.value;
    var cutText = currentText.slice(0, -1);
    if (cutText != currentText) input.value = cutText;
  };
  StartWithFilteringUtils.NeedToLockAndoidKeyEvents = function (control) {
    return (
      ASPx.Browser.AndroidMobilePlatform &&
      control &&
      control.LockAndroidKeyEvents
    );
  };
  ASPx.StartWithFilteringUtils = StartWithFilteringUtils;
  var ContainsFilteringUtils = {};
  ContainsFilteringUtils.ColumnSelectionStruct = function (
    index,
    startIndex,
    length
  ) {
    this.index = index;
    this.length = length;
    this.startIndex = startIndex;
  };
  ContainsFilteringUtils.IsFilterCrossPlaseHolder = function (
    filterStartIndex,
    filterEndIndex,
    template
  ) {
    var left = Math.max(filterStartIndex, template.realStartIndex);
    var right = Math.min(
      filterEndIndex,
      template.realStartIndex + template.realLength
    );
    return left < right;
  };
  ContainsFilteringUtils.GetColumnSelectionsForItem = function (
    itemValues,
    formatString,
    filterString
  ) {
    if (formatString == "")
      return this.GetSelectionForSingleColumnItem(itemValues, filterString);
    var result = [];
    var formatedString = ASPx.Formatter.Format(formatString, itemValues);
    var filterStartIndex = ASPx.Str.PrepareStringForFilter(
      formatedString
    ).indexOf(ASPx.Str.PrepareStringForFilter(filterString));
    if (filterStartIndex == -1) return result;
    var filterEndIndex = filterStartIndex + filterString.length;
    var templates = FormatStringHelper.GetPlaceHolderTemplates(formatString);
    this.SupplyTemplatesWithRealValues(itemValues, templates);
    for (var i = 0; i < templates.length; i++) {
      if (
        this.IsFilterCrossPlaseHolder(
          filterStartIndex,
          filterEndIndex,
          templates[i]
        )
      )
        result.push(
          this.GetColumnSelectionsForItemValue(
            templates[i],
            filterStartIndex,
            filterEndIndex
          )
        );
    }
    return result;
  };
  (ContainsFilteringUtils.GetColumnSelectionsForItemValue = function (
    template,
    filterStartIndex,
    filterEndIndex
  ) {
    var selectedTextStartIndex =
      filterStartIndex < template.realStartIndex
        ? 0
        : filterStartIndex - template.realStartIndex;
    var selectedTextEndIndex =
      filterEndIndex > template.realStartIndex + template.realLength
        ? template.realLength
        : filterEndIndex - template.realStartIndex;
    var selectedTextLength = selectedTextEndIndex - selectedTextStartIndex;
    return new this.ColumnSelectionStruct(
      template.index,
      selectedTextStartIndex,
      selectedTextLength
    );
  }),
    (ContainsFilteringUtils.GetSelectionForSingleColumnItem = function (
      itemValues,
      filterString
    ) {
      var selectedTextStartIndex = ASPx.Str.PrepareStringForFilter(
        itemValues[0]
      ).indexOf(ASPx.Str.PrepareStringForFilter(filterString));
      var selectedTextLength = filterString.length;
      return [
        new this.ColumnSelectionStruct(
          0,
          selectedTextStartIndex,
          selectedTextLength
        ),
      ];
    });
  (ContainsFilteringUtils.ResetFormatStringIndex = function (
    formatString,
    index
  ) {
    if (index != 0) return formatString.replace(index.toString(), "0");
    return formatString;
  }),
    (ContainsFilteringUtils.SupplyTemplatesWithRealValues = function (
      itemValues,
      templates
    ) {
      var shift = 0;
      for (var i = 0; i < templates.length; i++) {
        var formatString = this.ResetFormatStringIndex(
          templates[i].placeHolderString,
          templates[i].index
        );
        var currentItemValue = itemValues[templates[i].index];
        templates[i].realLength = ASPx.Formatter.Format(
          formatString,
          currentItemValue
        ).length;
        templates[i].realStartIndex += templates[i].startIndex + shift;
        shift +=
          templates[i].realLength - templates[i].placeHolderString.length;
      }
    });
  ContainsFilteringUtils.PrepareElementText = function (itemText) {
    return itemText
      ? itemText
          .replace(/\&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
      : "";
  };
  ContainsFilteringUtils.UnselectContainsTextInElement = function (
    element,
    selection
  ) {
    var currentText = ASPx.Attr.GetAttribute(element, "DXText");
    if (ASPx.IsExists(currentText)) {
      currentText = ContainsFilteringUtils.PrepareElementText(currentText);
      ASPx.SetInnerHtml(element, currentText === "" ? "&nbsp;" : currentText);
    }
  };
  ContainsFilteringUtils.ReselectContainsTextInElement = function (
    element,
    selection
  ) {
    var currentText = ASPx.GetInnerText(element);
    if (currentText.indexOf("</em>") != -1)
      ContainsFilteringUtils.UnselectContainsTextInElement(element, selection);
    return ContainsFilteringUtils.SelectContainsTextInElement(
      element,
      selection
    );
  };
  ContainsFilteringUtils.SelectContainsTextInElement = function (
    element,
    selection
  ) {
    if (selection.startIndex == -1) return;
    var currentText = ASPx.Attr.GetAttribute(element, "DXText");
    if (!ASPx.IsExists(currentText))
      ASPx.Attr.SetAttribute(element, "DXText", ASPx.GetInnerText(element));
    var oldInnerText = ASPx.GetInnerText(element);
    var newInnerText =
      ContainsFilteringUtils.PrepareElementText(
        oldInnerText.substr(0, selection.startIndex)
      ) +
      "<em>" +
      oldInnerText.substr(selection.startIndex, selection.length) +
      "</em>" +
      ContainsFilteringUtils.PrepareElementText(
        oldInnerText.substr(selection.startIndex + selection.length)
      );
    ASPx.SetInnerHtml(element, newInnerText);
  };
  ASPx.ContainsFilteringUtils = ContainsFilteringUtils;
  ASPx.MakeEqualControlsWidth = function (name1, name2) {
    var control1 = ASPx.GetControlCollection().Get(name1);
    var control2 = ASPx.GetControlCollection().Get(name2);
    if (control1 && control2) {
      var width = Math.max(control1.GetWidth(), control2.GetWidth());
      control1.SetWidth(width);
      control2.SetWidth(width);
    }
  };
  ASPxClientUtils = {};
  ASPxClientUtils.agent = Browser.UserAgent;
  ASPxClientUtils.opera = Browser.Opera;
  ASPxClientUtils.opera9 = Browser.Opera && Browser.MajorVersion == 9;
  ASPxClientUtils.safari = Browser.Safari;
  ASPxClientUtils.safari3 = Browser.Safari && Browser.MajorVersion == 3;
  ASPxClientUtils.safariMacOS = Browser.Safari && Browser.MacOSPlatform;
  ASPxClientUtils.chrome = Browser.Chrome;
  ASPxClientUtils.ie = Browser.IE;
  ASPxClientUtils.ie7 = Browser.IE && Browser.MajorVersion == 7;
  ASPxClientUtils.firefox = Browser.Firefox;
  ASPxClientUtils.firefox3 = Browser.Firefox && Browser.MajorVersion == 3;
  ASPxClientUtils.mozilla = Browser.Mozilla;
  ASPxClientUtils.netscape = Browser.Netscape;
  ASPxClientUtils.browserVersion = Browser.Version;
  ASPxClientUtils.browserMajorVersion = Browser.MajorVersion;
  ASPxClientUtils.macOSPlatform = Browser.MacOSPlatform;
  ASPxClientUtils.windowsPlatform = Browser.WindowsPlatform;
  ASPxClientUtils.webKitFamily = Browser.WebKitFamily;
  ASPxClientUtils.netscapeFamily = Browser.NetscapeFamily;
  ASPxClientUtils.touchUI = Browser.TouchUI;
  ASPxClientUtils.webKitTouchUI = Browser.WebKitTouchUI;
  ASPxClientUtils.msTouchUI = Browser.MSTouchUI;
  ASPxClientUtils.iOSPlatform = Browser.MacOSMobilePlatform;
  ASPxClientUtils.androidPlatform = Browser.AndroidMobilePlatform;
  ASPxClientUtils.ArrayInsert = Data.ArrayInsert;
  ASPxClientUtils.ArrayRemove = Data.ArrayRemove;
  ASPxClientUtils.ArrayRemoveAt = Data.ArrayRemoveAt;
  ASPxClientUtils.ArrayClear = Data.ArrayClear;
  ASPxClientUtils.ArrayIndexOf = Data.ArrayIndexOf;
  ASPxClientUtils.AttachEventToElement = Evt.AttachEventToElement;
  ASPxClientUtils.DetachEventFromElement = Evt.DetachEventFromElement;
  ASPxClientUtils.GetEventSource = Evt.GetEventSource;
  ASPxClientUtils.GetEventX = Evt.GetEventX;
  ASPxClientUtils.GetEventY = Evt.GetEventY;
  ASPxClientUtils.GetKeyCode = Evt.GetKeyCode;
  ASPxClientUtils.PreventEvent = Evt.PreventEvent;
  ASPxClientUtils.PreventEventAndBubble = Evt.PreventEventAndBubble;
  ASPxClientUtils.PreventDragStart = Evt.PreventDragStart;
  ASPxClientUtils.ClearSelection = Selection.Clear;
  ASPxClientUtils.IsExists = ASPx.IsExists;
  ASPxClientUtils.IsFunction = ASPx.IsFunction;
  ASPxClientUtils.GetAbsoluteX = ASPx.GetAbsoluteX;
  ASPxClientUtils.GetAbsoluteY = ASPx.GetAbsoluteY;
  ASPxClientUtils.SetAbsoluteX = ASPx.SetAbsoluteX;
  ASPxClientUtils.SetAbsoluteY = ASPx.SetAbsoluteY;
  ASPxClientUtils.GetDocumentScrollTop = ASPx.GetDocumentScrollTop;
  ASPxClientUtils.GetDocumentScrollLeft = ASPx.GetDocumentScrollLeft;
  ASPxClientUtils.GetDocumentClientWidth = ASPx.GetDocumentClientWidth;
  ASPxClientUtils.GetDocumentClientHeight = ASPx.GetDocumentClientHeight;
  ASPxClientUtils.GetIsParent = ASPx.GetIsParent;
  ASPxClientUtils.GetParentById = ASPx.GetParentById;
  ASPxClientUtils.GetParentByTagName = ASPx.GetParentByTagName;
  ASPxClientUtils.GetParentByClassName = ASPx.GetParentByPartialClassName;
  ASPxClientUtils.GetChildById = ASPx.GetChildById;
  ASPxClientUtils.GetChildByTagName = ASPx.GetChildByTagName;
  ASPxClientUtils.SetCookie = Cookie.SetCookie;
  ASPxClientUtils.GetCookie = Cookie.GetCookie;
  ASPxClientUtils.DeleteCookie = Cookie.DelCookie;
  ASPxClientUtils.GetShortcutCode = ASPx.GetShortcutCode;
  ASPxClientUtils.GetShortcutCodeByEvent = ASPx.GetShortcutCodeByEvent;
  ASPxClientUtils.StringToShortcutCode = ASPx.ParseShortcutString;
  ASPxClientUtils.Trim = Str.Trim;
  ASPxClientUtils.TrimStart = Str.TrimStart;
  ASPxClientUtils.TrimEnd = Str.TrimEnd;
  window.ASPxClientUtils = ASPxClientUtils;
})();

(function () {
  ASPx.classesScriptParsed = false;
  ASPx.documentLoaded = false;
  ASPx.CallbackType = {
    Data: "d",
    Common: "c",
  };
  ASPx.callbackState = {
    aborted: "aborted",
    inTurn: "inTurn",
    sent: "sent",
  };
  var ASPxClientEvent = ASPx.CreateClass(null, {
    constructor: function () {
      this.handlerInfoList = [];
    },
    AddHandler: function (handler, executionContext) {
      if (typeof executionContext == "undefined") executionContext = null;
      this.RemoveHandler(handler, executionContext);
      var handlerInfo = ASPxClientEvent.CreateHandlerInfo(
        handler,
        executionContext
      );
      this.handlerInfoList.push(handlerInfo);
    },
    RemoveHandler: function (handler, executionContext) {
      this.removeHandlerByCondition(function (handlerInfo) {
        return (
          handlerInfo.handler == handler &&
          (!executionContext ||
            handlerInfo.executionContext == executionContext)
        );
      });
    },
    removeHandlerByCondition: function (predicate) {
      for (var i = this.handlerInfoList.length - 1; i >= 0; i--) {
        var handlerInfo = this.handlerInfoList[i];
        if (predicate(handlerInfo))
          ASPx.Data.ArrayRemoveAt(this.handlerInfoList, i);
      }
    },
    removeHandlerByControlName: function (controlName) {
      this.removeHandlerByCondition(function (handlerInfo) {
        return (
          handlerInfo.executionContext &&
          handlerInfo.executionContext.name === controlName
        );
      });
    },
    ClearHandlers: function () {
      this.handlerInfoList.length = 0;
    },
    FireEvent: function (obj, args) {
      for (var i = 0; i < this.handlerInfoList.length; i++) {
        var handlerInfo = this.handlerInfoList[i];
        handlerInfo.handler.call(handlerInfo.executionContext, obj, args);
      }
    },
    InsertFirstHandler: function (handler, executionContext) {
      if (typeof executionContext == "undefined") executionContext = null;
      var handlerInfo = ASPxClientEvent.CreateHandlerInfo(
        handler,
        executionContext
      );
      ASPx.Data.ArrayInsert(this.handlerInfoList, handlerInfo, 0);
    },
    IsEmpty: function () {
      return this.handlerInfoList.length == 0;
    },
  });
  ASPxClientEvent.CreateHandlerInfo = function (handler, executionContext) {
    return {
      handler: handler,
      executionContext: executionContext,
    };
  };
  var ASPxClientEventArgs = ASPx.CreateClass(null, {
    constructor: function () {},
  });
  ASPxClientEventArgs.Empty = new ASPxClientEventArgs();
  var ASPxClientCancelEventArgs = ASPx.CreateClass(ASPxClientEventArgs, {
    constructor: function () {
      this.constructor.prototype.constructor.call(this);
      this.cancel = false;
    },
  });
  var ASPxClientProcessingModeEventArgs = ASPx.CreateClass(
    ASPxClientEventArgs,
    {
      constructor: function (processOnServer) {
        this.constructor.prototype.constructor.call(this);
        this.processOnServer = processOnServer;
      },
    }
  );
  var ASPxClientProcessingModeCancelEventArgs = ASPx.CreateClass(
    ASPxClientProcessingModeEventArgs,
    {
      constructor: function (processOnServer) {
        this.constructor.prototype.constructor.call(this, processOnServer);
        this.cancel = false;
      },
    }
  );
  var ASPxClientBeginCallbackEventArgs = ASPx.CreateClass(ASPxClientEventArgs, {
    constructor: function (command) {
      this.constructor.prototype.constructor.call(this);
      this.command = command;
    },
  });
  var ASPxClientGlobalBeginCallbackEventArgs = ASPx.CreateClass(
    ASPxClientBeginCallbackEventArgs,
    {
      constructor: function (control, command) {
        this.constructor.prototype.constructor.call(this, command);
        this.control = control;
      },
    }
  );
  var ASPxClientEndCallbackEventArgs = ASPx.CreateClass(ASPxClientEventArgs, {
    constructor: function () {
      this.constructor.prototype.constructor.call(this);
    },
  });
  var ASPxClientGlobalEndCallbackEventArgs = ASPx.CreateClass(
    ASPxClientEndCallbackEventArgs,
    {
      constructor: function (control) {
        this.constructor.prototype.constructor.call(this);
        this.control = control;
      },
    }
  );
  var ASPxClientCustomDataCallbackEventArgs = ASPx.CreateClass(
    ASPxClientEventArgs,
    {
      constructor: function (result) {
        this.constructor.prototype.constructor.call(this);
        this.result = result;
      },
    }
  );
  var ASPxClientCallbackErrorEventArgs = ASPx.CreateClass(ASPxClientEventArgs, {
    constructor: function (message, callbackId) {
      this.constructor.prototype.constructor.call(this);
      this.message = message;
      this.handled = false;
      this.callbackId = callbackId;
    },
  });
  var ASPxClientGlobalCallbackErrorEventArgs = ASPx.CreateClass(
    ASPxClientCallbackErrorEventArgs,
    {
      constructor: function (control, message, callbackId) {
        this.constructor.prototype.constructor.call(this, message, callbackId);
        this.control = control;
      },
    }
  );
  var ASPxClientValidationCompletedEventArgs = ASPx.CreateClass(
    ASPxClientEventArgs,
    {
      constructor: function (
        container,
        validationGroup,
        invisibleControlsValidated,
        isValid,
        firstInvalidControl,
        firstVisibleInvalidControl
      ) {
        this.constructor.prototype.constructor.call(this);
        this.container = container;
        this.validationGroup = validationGroup;
        this.invisibleControlsValidated = invisibleControlsValidated;
        this.isValid = isValid;
        this.firstInvalidControl = firstInvalidControl;
        this.firstVisibleInvalidControl = firstVisibleInvalidControl;
      },
    }
  );
  var ASPxClientControlsInitializedEventArgs = ASPx.CreateClass(
    ASPxClientEventArgs,
    {
      constructor: function (isCallback) {
        this.isCallback = isCallback;
      },
    }
  );
  var CollectionBase = ASPx.CreateClass(null, {
    constructor: function () {
      this.elements = {};
      this.isASPxClientCollection = true;
    },
    Add: function (key, element) {
      this.elements[key] = element;
    },
    Remove: function (key) {
      delete this.elements[key];
    },
    Clear: function () {
      this.elements = {};
    },
    Get: function (key) {
      return this.elements[key];
    },
  });
  var ASPxClientControlCollection = ASPx.CreateClass(CollectionBase, {
    constructor: function () {
      this.constructor.prototype.constructor.call(this);
      this.prevWndWidth = "";
      this.prevWndHeight = "";
      this.requestCountInternal = 0;
      this.BeforeInitCallback = new ASPxClientEvent();
      this.ControlsInitialized = new ASPxClientEvent();
      this.BrowserWindowResized = new ASPxClientEvent();
      this.BeginCallback = new ASPxClientEvent();
      this.EndCallback = new ASPxClientEvent();
      this.CallbackError = new ASPxClientEvent();
      this.ValidationCompleted = new ASPxClientEvent();
      aspxGetControlCollectionCollection().Add(this);
    },
    Add: function (element) {
      var existsElement = this.Get(element.name);
      if (existsElement && existsElement !== element)
        this.Remove(existsElement);
      this.constructor.prototype.Add.call(this, element.name, element);
    },
    Remove: function (element) {
      if (element && element instanceof ASPxClientControl) element.OnDispose();
      this.constructor.prototype.Remove.call(this, element.name);
    },
    GetGlobal: function (name) {
      var result = window[name];
      return result && result.isASPxClientControl ? result : null;
    },
    GetByName: function (name) {
      return this.Get(name) || this.GetGlobal(name);
    },
    GetCollectionType: function () {
      return ASPxClientControlCollection.BaseCollectionType;
    },
    ForEachControl: function (processFunc, context) {
      if (!context) context = this;
      for (var name in this.elements) {
        var control = this.elements[name];
        if (Ident.IsASPxClientControl(control))
          if (processFunc.call(context, control)) return;
      }
    },
    forEachControlHierarchy: function (
      container,
      context,
      collapseControls,
      processFunc
    ) {
      context = context || this;
      var controlTree = new ControlTree(this, container);
      controlTree.forEachControl(collapseControls, function (control) {
        processFunc.call(context, control);
      });
    },
    AdjustControls: function (container, collapseControls) {
      container = container || null;
      window.setTimeout(
        function () {
          this.AdjustControlsCore(container, collapseControls);
        }.aspxBind(this),
        0
      );
    },
    AdjustControlsCore: function (container, collapseControls) {
      this.forEachControlHierarchy(
        container,
        this,
        collapseControls,
        function (control) {
          control.AdjustControl();
        }
      );
    },
    CollapseControls: function (container) {
      this.ProcessControlsInContainer(container, function (control) {
        if (control.isASPxClientEdit) control.CollapseEditor();
        else if (
          !!window.ASPxClientRibbon &&
          control instanceof ASPxClientRibbon
        )
          control.CollapseControl();
      });
    },
    AtlasInitialize: function (isCallback) {
      if (ASPx.Browser.IE && ASPx.Browser.MajorVersion < 9) {
        var func = function () {
          if (_aspxIsLinksLoaded()) _aspxProcessScriptsAndLinks("", isCallback);
          else setTimeout(func, 100);
        };
        func();
      } else _aspxProcessScriptsAndLinks("", isCallback);
    },
    DOMContentLoaded: function () {
      this.ForEachControl(function (control) {
        control.DOMContentLoaded();
      });
    },
    Initialize: function () {
      aspxGetPostHandler().Post.AddHandler(
        function (s, e) {
          this.OnPost(e);
        }.aspxBind(this)
      );
      aspxGetPostHandler().PostFinalization.AddHandler(
        function (s, e) {
          this.OnPostFinalization(e);
        }.aspxBind(this)
      );
      this.InitializeElements(false);
      if (typeof Sys != "undefined" && typeof Sys.Application != "undefined") {
        var checkIsInitialized = function () {
          if (Sys.Application.get_isInitialized())
            Sys.Application.add_load(aspxCAInit);
          else setTimeout(checkIsInitialized, 0);
        };
        checkIsInitialized();
      }
      this.InitWindowSizeCache();
    },
    InitializeElements: function (isCallback) {
      this.ForEachControl(function (control) {
        if (!control.isInitialized) control.Initialize();
      });
      this.AfterInitializeElementsLeadingCall();
      this.AfterInitializeElements();
      this.RaiseControlsInitialized(isCallback);
    },
    AfterInitializeElementsLeadingCall: function () {
      var controls = {};
      controls[ASPxClientControl.LeadingAfterInitCallConsts.Direct] = [];
      controls[ASPxClientControl.LeadingAfterInitCallConsts.Reverse] = [];
      this.ForEachControl(function (control) {
        if (
          control.leadingAfterInitCall !=
            ASPxClientControl.LeadingAfterInitCallConsts.None &&
          !control.isInitialized
        )
          controls[control.leadingAfterInitCall].push(control);
      });
      var directInitControls =
          controls[ASPxClientControl.LeadingAfterInitCallConsts.Direct],
        reverseInitControls =
          controls[ASPxClientControl.LeadingAfterInitCallConsts.Reverse];
      for (var i = 0, control; (control = directInitControls[i]); i++)
        control.AfterInitialize();
      for (
        var i = reverseInitControls.length - 1, control;
        (control = reverseInitControls[i]);
        i--
      )
        control.AfterInitialize();
    },
    AfterInitializeElements: function () {
      this.ForEachControl(function (control) {
        if (
          control.leadingAfterInitCall ==
            ASPxClientControl.LeadingAfterInitCallConsts.None &&
          !control.isInitialized
        )
          control.AfterInitialize();
      });
    },
    DoFinalizeCallback: function () {
      this.ForEachControl(function (control) {
        control.DoFinalizeCallback();
      });
    },
    ProcessControlsInContainer: function (container, processFunc) {
      this.ForEachControl(function (control) {
        if (!container || this.IsControlInContainer(container, control))
          processFunc(control);
      });
    },
    IsControlInContainer: function (container, control) {
      if (control.GetMainElement) {
        var mainElement = control.GetMainElement();
        if (mainElement && mainElement != container) {
          if (ASPx.GetIsParent(container, mainElement)) return true;
        }
      }
      return false;
    },
    RaiseControlsInitialized: function (isCallback) {
      if (typeof isCallback == "undefined") isCallback = true;
      var args = new ASPxClientControlsInitializedEventArgs(isCallback);
      if (!this.ControlsInitialized.IsEmpty())
        this.ControlsInitialized.FireEvent(this, args);
      this.ForEachControl(function (control) {
        control.OnGlobalControlsInitialized(args);
      });
    },
    RaiseBrowserWindowResized: function () {
      var args = new ASPxClientEventArgs();
      if (!this.BrowserWindowResized.IsEmpty())
        this.BrowserWindowResized.FireEvent(this, args);
      this.ForEachControl(function (control) {
        control.OnGlobalBrowserWindowResized(args);
      });
    },
    RaiseBeginCallback: function (control, command) {
      var args = new ASPxClientGlobalBeginCallbackEventArgs(control, command);
      if (!this.BeginCallback.IsEmpty())
        this.BeginCallback.FireEvent(this, args);
      this.ForEachControl(function (control) {
        control.OnGlobalBeginCallback(args);
      });
      this.IncrementRequestCount();
    },
    RaiseEndCallback: function (control) {
      var args = new ASPxClientGlobalEndCallbackEventArgs(control);
      if (!this.EndCallback.IsEmpty()) this.EndCallback.FireEvent(this, args);
      this.ForEachControl(function (control) {
        control.OnGlobalEndCallback(args);
      });
      this.DecrementRequestCount();
    },
    InCallback: function () {
      return this.requestCountInternal > 0;
    },
    RaiseCallbackError: function (control, message, callbackId) {
      var args = new ASPxClientGlobalCallbackErrorEventArgs(
        control,
        message,
        callbackId
      );
      if (!this.CallbackError.IsEmpty())
        this.CallbackError.FireEvent(this, args);
      this.ForEachControl(function (control) {
        control.OnGlobalCallbackError(args);
      });
      if (args.handled) return { isHandled: true, errorMessage: args.message };
      return { isHandled: false, errorMessage: message };
    },
    RaiseValidationCompleted: function (
      container,
      validationGroup,
      invisibleControlsValidated,
      isValid,
      firstInvalidControl,
      firstVisibleInvalidControl
    ) {
      var args = new ASPxClientValidationCompletedEventArgs(
        container,
        validationGroup,
        invisibleControlsValidated,
        isValid,
        firstInvalidControl,
        firstVisibleInvalidControl
      );
      if (!this.ValidationCompleted.IsEmpty())
        this.ValidationCompleted.FireEvent(this, args);
      this.ForEachControl(function (control) {
        control.OnGlobalValidationCompleted(args);
      });
    },
    Before_WebForm_InitCallback: function (callbackOwnerID) {
      var args = new BeforeInitCallbackEventArgs(callbackOwnerID);
      this.BeforeInitCallback.FireEvent(this, args);
    },
    InitWindowSizeCache: function () {
      this.prevWndWidth = ASPx.GetDocumentClientWidth();
      this.prevWndHeight = ASPx.GetDocumentClientHeight();
    },
    OnBrowserWindowResize: function (evt) {
      var shouldIgnoreNestedEvents =
        ASPx.Browser.IE && ASPx.Browser.MajorVersion == 8;
      if (shouldIgnoreNestedEvents) {
        if (
          this.prevWndWidth === "" ||
          this.prevWndHeight === "" ||
          this.browserWindowResizeLocked
        )
          return;
        this.browserWindowResizeLocked = true;
      }
      this.OnBrowserWindowResizeCore(evt);
      if (shouldIgnoreNestedEvents) this.browserWindowResizeLocked = false;
    },
    OnBrowserWindowResizeCore: function (htmlEvent) {
      var args = this.CreateOnBrowserWindowResizeEventArgs(htmlEvent);
      if (this.CalculateIsBrowserWindowSizeChanged()) {
        this.forEachControlHierarchy(null, this, true, function (control) {
          if (control.IsDOMInitialized())
            control.OnBrowserWindowResizeInternal(args);
        });
        this.RaiseBrowserWindowResized();
      }
    },
    CreateOnBrowserWindowResizeEventArgs: function (htmlEvent) {
      return {
        htmlEvent: htmlEvent,
        wndWidth: ASPx.GetDocumentClientWidth(),
        wndHeight: ASPx.GetDocumentClientHeight(),
        prevWndWidth: this.prevWndWidth,
        prevWndHeight: this.prevWndHeight,
      };
    },
    CalculateIsBrowserWindowSizeChanged: function () {
      var wndWidth = ASPx.GetDocumentClientWidth();
      var wndHeight = ASPx.GetDocumentClientHeight();
      var isBrowserWindowSizeChanged =
        this.prevWndWidth != wndWidth || this.prevWndHeight != wndHeight;
      if (isBrowserWindowSizeChanged) {
        this.prevWndWidth = wndWidth;
        this.prevWndHeight = wndHeight;
        return true;
      }
      return false;
    },
    OnPost: function (args) {
      this.ForEachControl(function (control) {
        control.OnPost(args);
      }, null);
    },
    OnPostFinalization: function (args) {
      this.ForEachControl(function (control) {
        control.OnPostFinalization(args);
      }, null);
    },
    IncrementRequestCount: function () {
      this.requestCountInternal++;
    },
    DecrementRequestCount: function () {
      this.requestCountInternal--;
    },
  });
  ASPxClientControlCollection.BaseCollectionType = "Control";
  var controlCollection = null;
  function aspxGetControlCollection() {
    if (controlCollection == null)
      controlCollection = new ASPxClientControlCollection();
    return controlCollection;
  }
  var ControlCollectionCollection = ASPx.CreateClass(CollectionBase, {
    constructor: function () {
      this.constructor.prototype.constructor.call(this);
    },
    Add: function (element) {
      var key = element.GetCollectionType();
      if (!key) throw "The collection type isn't specified.";
      if (this.Get(key))
        throw "The collection with type='" + key + "' already exists.";
      this.constructor.prototype.Add.call(this, key, element);
    },
    RemoveDisposedControls: function () {
      var baseCollection = this.Get(
        ASPxClientControlCollection.BaseCollectionType
      );
      var disposedControls = [];
      for (var name in baseCollection.elements) {
        var control = baseCollection.elements[name];
        if (!ASPx.Ident.IsASPxClientControl(control)) continue;
        if (control.IsDOMDisposed()) disposedControls.push(control);
      }
      for (var i = 0; i < disposedControls.length; i++) {
        for (var type in this.elements) {
          var collection = this.elements[type];
          if (!ASPx.Ident.IsASPxClientCollection(collection)) continue;
          collection.Remove(disposedControls[i]);
        }
      }
    },
  });
  var controlCollectionCollection = null;
  function aspxGetControlCollectionCollection() {
    if (controlCollectionCollection == null)
      controlCollectionCollection = new ControlCollectionCollection();
    return controlCollectionCollection;
  }
  var GarbageCollector = ASPx.CreateClass(null, {
    constructor: function () {
      this.interval = 5000;
      this.intervalID = window.setInterval(
        function () {
          this.CollectObjects();
        }.aspxBind(this),
        this.interval
      );
    },
    CollectObjects: function () {
      ASPx.GetControlCollectionCollection().RemoveDisposedControls();
      if (typeof ASPx.GetStateController != "undefined")
        ASPx.GetStateController().RemoveDisposedItems();
      if (typeof ASPxClientRatingControl != "undefined")
        ASPxClientRatingControl.RemoveDisposedElementUnderCursor();
      var postHandler = aspxGetPostHandler();
      if (postHandler) postHandler.RemoveDisposedFormsFromCache();
    },
  });
  var gcCollector = new GarbageCollector();
  var ControlTree = ASPx.CreateClass(null, {
    constructor: function (controlCollection, container) {
      this.container = container;
      this.domMap = {};
      this.rootNode = this.createNode(null, null);
      this.createControlTree(controlCollection, container);
    },
    forEachControl: function (collapseControls, processFunc) {
      var observer = _aspxGetDomObserver();
      observer.pause(this.container, true);
      var documentScrollInfo;
      if (collapseControls) {
        documentScrollInfo = ASPx.GetOuterScrollPosition(document.body);
        this.collapseControls(this.rootNode);
      }
      var adjustNodes = [],
        autoHeightNodes = [];
      var requireReAdjust = this.forEachControlCore(
        this.rootNode,
        collapseControls,
        processFunc,
        adjustNodes,
        autoHeightNodes
      );
      if (requireReAdjust)
        this.forEachControlsBackward(
          adjustNodes,
          collapseControls,
          processFunc
        );
      else {
        for (var i = 0, node; (node = autoHeightNodes[i]); i++)
          node.control.AdjustAutoHeight();
      }
      if (collapseControls) ASPx.RestoreOuterScrollPosition(documentScrollInfo);
      observer.resume(this.container, true);
    },
    forEachControlCore: function (
      node,
      collapseControls,
      processFunc,
      adjustNodes,
      autoHeightNodes
    ) {
      var requireReAdjust = false,
        size,
        newSize;
      if (node.control) {
        var checkReadjustment =
          collapseControls &&
          node.control.IsControlCollapsed() &&
          node.control.CanCauseReadjustment();
        if (checkReadjustment)
          size = node.control.GetControlPercentMarkerSize(false, true);
        if (
          node.control.IsControlCollapsed() &&
          !node.control.IsExpandableByAdjustment()
        )
          node.control.ExpandControl();
        node.control.isInsideHierarchyAdjustment = true;
        processFunc(node.control);
        node.control.isInsideHierarchyAdjustment = false;
        if (checkReadjustment) {
          newSize = node.control.GetControlPercentMarkerSize(false, true);
          requireReAdjust = size.width !== newSize.width;
        }
        if (node.control.sizingConfig.supportAutoHeight)
          autoHeightNodes.push(node);
        node.control.ResetControlPercentMarkerSize();
      }
      for (var childNode, i = 0; (childNode = node.children[i]); i++)
        requireReAdjust =
          this.forEachControlCore(
            childNode,
            collapseControls,
            processFunc,
            adjustNodes,
            autoHeightNodes
          ) || requireReAdjust;
      adjustNodes.push(node);
      return requireReAdjust;
    },
    forEachControlsBackward: function (
      adjustNodes,
      collapseControls,
      processFunc
    ) {
      for (var i = 0, node; (node = adjustNodes[i]); i++)
        this.forEachControlsBackwardCore(node, collapseControls, processFunc);
    },
    forEachControlsBackwardCore: function (
      node,
      collapseControls,
      processFunc
    ) {
      if (node.control) processFunc(node.control);
      if (node.children.length > 1) {
        for (var i = 0, childNode; (childNode = node.children[i]); i++) {
          if (childNode.control) processFunc(childNode.control);
        }
      }
    },
    collapseControls: function (node) {
      for (var childNode, i = 0; (childNode = node.children[i]); i++)
        this.collapseControls(childNode);
      if (node.control && node.control.NeedCollapseControl())
        node.control.CollapseControl();
    },
    createControlTree: function (controlCollection, container) {
      controlCollection.ProcessControlsInContainer(
        container,
        function (control) {
          control.RegisterInControlTree(this);
        }.aspxBind(this)
      );
      var fixedNodes = [];
      var fixedNodesChildren = [];
      for (var domElementID in this.domMap) {
        if (!this.domMap.hasOwnProperty(domElementID)) continue;
        var node = this.domMap[domElementID];
        var controlOwner = node.control ? node.control.controlOwner : null;
        if (controlOwner && this.domMap[controlOwner.name]) continue;
        if (this.isFixedNode(node)) fixedNodes.push(node);
        else {
          var parentNode = this.findParentNode(domElementID);
          parentNode = parentNode || this.rootNode;
          if (this.isFixedNode(parentNode)) fixedNodesChildren.push(node);
          else {
            var childNode = node.mainNode || node;
            this.addChildNode(parentNode, childNode);
          }
        }
      }
      for (var i = fixedNodes.length - 1; i >= 0; i--)
        this.insertChildNode(this.rootNode, fixedNodes[i], 0);
      for (var i = fixedNodesChildren.length - 1; i >= 0; i--)
        this.insertChildNode(this.rootNode, fixedNodesChildren[i], 0);
    },
    findParentNode: function (id) {
      var element = document.getElementById(id).parentNode;
      while (element && element.tagName !== "BODY") {
        if (element.id) {
          var parentNode = this.domMap[element.id];
          if (parentNode) return parentNode;
        }
        element = element.parentNode;
      }
      return null;
    },
    addChildNode: function (node, childNode) {
      if (!childNode.parentNode) {
        node.children.push(childNode);
        childNode.parentNode = node;
      }
    },
    insertChildNode: function (node, childNode, index) {
      if (!childNode.parentNode) {
        ASPx.Data.ArrayInsert(node.children, childNode, index);
        childNode.parentNode = node;
      }
    },
    addRelatedNode: function (node, relatedNode) {
      this.addChildNode(node, relatedNode);
      relatedNode.mainNode = node;
    },
    isFixedNode: function (node) {
      return node.control && node.control.HasFixedPosition();
    },
    createNode: function (domElementID, control) {
      var node = {
        control: control,
        children: [],
        parentNode: null,
        mainNode: null,
      };
      if (domElementID) this.domMap[domElementID] = node;
      return node;
    },
  });
  var ASPxClientControl = ASPx.CreateClass(null, {
    constructor: function (name) {
      this.isASPxClientControl = true;
      this.name = name;
      this.uniqueID = name;
      this.globalName = name;
      this.stateObject = null;
      this.encodeHtml = true;
      this.enabled = true;
      this.clientEnabled = true;
      this.savedClientEnabled = true;
      this.clientVisible = true;
      this.accessibilityCompliant = false;
      this.rtl = false;
      this.enableEllipsis = false;
      this.autoPostBack = false;
      this.allowMultipleCallbacks = true;
      this.callBack = null;
      this.enableCallbackAnimation = false;
      this.enableSlideCallbackAnimation = false;
      this.slideAnimationDirection = null;
      this.beginCallbackAnimationProcessing = false;
      this.endCallbackAnimationProcessing = false;
      this.savedCallbackResult = null;
      this.savedCallbacks = null;
      this.isCallbackAnimationPrevented = false;
      this.lpDelay = 300;
      this.lpTimer = -1;
      this.isNative = false;
      this.requestCount = 0;
      this.enableSwipeGestures = false;
      this.supportGestures = false;
      this.repeatedGestureValue = 0;
      this.repeatedGestureCount = 0;
      this.isInitialized = false;
      this.isControlCollapsed = false;
      this.initialFocused = false;
      this.leadingAfterInitCall =
        ASPxClientControl.LeadingAfterInitCallConsts.None;
      this.isInsideHierarchyAdjustment = false;
      this.controlOwner = null;
      this.adjustedSizes = {};
      this.serverEvents = [];
      this.dialogContentHashTable = {};
      this.loadingPanelElement = null;
      this.loadingDivElement = null;
      this.hasPhantomLoadingElements = false;
      this.mainElement = null;
      this.renderIFrameForPopupElements = false;
      this.widthValueSetInPercentage = false;
      this.heightValueSetInPercentage = false;
      this.touchUIMouseScroller = null;
      this.verticalAlignedElements = {};
      this.wrappedTextContainers = {};
      this.scrollPositionState = {};
      this.hiddenFields = {};
      this.sizingConfig = {
        allowSetWidth: true,
        allowSetHeight: true,
        correction: false,
        adjustControl: false,
        supportPercentHeight: false,
        supportAutoHeight: false,
      };
      this.percentSizeConfig = {
        width: -1,
        height: -1,
        markerWidth: -1,
        markerHeight: -1,
      };
      this.Init = new ASPxClientEvent();
      this.BeginCallback = new ASPxClientEvent();
      this.EndCallback = new ASPxClientEvent();
      this.EndCallbackAnimationStart = new ASPxClientEvent();
      this.CallbackError = new ASPxClientEvent();
      this.CustomDataCallback = new ASPxClientEvent();
      aspxGetControlCollection().Add(this);
    },
    Initialize: function () {
      if (this.callBack != null) this.InitializeCallBackData();
      if (this.useCallbackQueue())
        this.callbackQueueHelper = new ASPx.ControlCallbackQueueHelper(this);
    },
    InlineInitialize: function () {
      this.InitializeDOM();
      this.savedClientEnabled = this.clientEnabled;
    },
    InitializeGestures: function () {
      if (this.enableSwipeGestures && this.supportGestures) {
        ASPx.GesturesHelper.AddSwipeGestureHandler(
          this.name,
          function () {
            return this.GetCallbackAnimationElement();
          }.aspxBind(this),
          function (evt) {
            return this.CanHandleGestureCore(evt);
          }.aspxBind(this),
          function (value) {
            return this.AllowStartGesture();
          }.aspxBind(this),
          function (value) {
            return this.StartGesture();
          }.aspxBind(this),
          function (value) {
            return this.AllowExecuteGesture(value);
          }.aspxBind(this),
          function (value) {
            this.ExecuteGesture(value);
          }.aspxBind(this),
          function (value) {
            this.CancelGesture(value);
          }.aspxBind(this),
          this.GetDefaultanimationEngineType()
        );
        if (ASPx.Browser.MSTouchUI)
          this.touchUIMouseScroller = ASPx.MouseScroller.Create(
            function () {
              return this.GetCallbackAnimationElement();
            }.aspxBind(this),
            function () {
              return null;
            },
            function () {
              return this.GetCallbackAnimationElement();
            }.aspxBind(this),
            function (element) {
              return this.NeedPreventTouchUIMouseScrolling(element);
            }.aspxBind(this),
            true
          );
      }
    },
    InitGlobalVariable: function (varName) {
      if (!window) return;
      this.globalName = varName;
      window[varName] = this;
    },
    useCallbackQueue: function () {
      return false;
    },
    NeedPreventTouchUIMouseScrolling: function (element) {
      return false;
    },
    InitailizeFocus: function () {
      if (this.initialFocused && this.IsVisible()) this.Focus();
    },
    AfterCreate: function () {
      this.InlineInitialize();
      this.InitializeGestures();
      if (
        !this.CanInitializeAdjustmentOnDOMContentLoaded() ||
        startupScriptsRunning
      )
        this.InitializeAdjustment();
    },
    DOMContentLoaded: function () {
      if (this.CanInitializeAdjustmentOnDOMContentLoaded())
        this.InitializeAdjustment();
    },
    CanInitializeAdjustmentOnDOMContentLoaded: function () {
      return !ASPx.Browser.IE || ASPx.Browser.Version >= 10;
    },
    InitializeAdjustment: function () {
      this.UpdateAdjustmentFlags();
      this.AdjustControl();
    },
    AfterInitialize: function () {
      this.AdjustControl();
      this.InitailizeFocus();
      this.isInitialized = true;
      this.RaiseInit();
      if (this.savedCallbacks) {
        for (var i = 0; i < this.savedCallbacks.length; i++)
          this.CreateCallbackInternal(
            this.savedCallbacks[i].arg,
            this.savedCallbacks[i].command,
            false,
            this.savedCallbacks[i].callbackInfo
          );
        this.savedCallbacks = null;
      }
    },
    InitializeCallBackData: function () {},
    IsStateControllerEnabled: function () {
      return (
        typeof ASPx.GetStateController != "undefined" &&
        ASPx.GetStateController()
      );
    },
    InitializeDOM: function () {
      var mainElement = this.GetMainElement();
      if (mainElement) mainElement["dxinit"] = true;
    },
    IsDOMInitialized: function () {
      var mainElement = this.GetMainElement();
      return mainElement && mainElement["dxinit"];
    },
    IsDOMDisposed: function () {
      return !ASPx.IsExistsElement(this.GetMainElement());
    },
    HtmlEncode: function (text) {
      return this.encodeHtml ? ASPx.Str.EncodeHtml(text) : text;
    },
    GetWidth: function () {
      return this.GetMainElement().offsetWidth;
    },
    GetHeight: function () {
      return this.GetMainElement().offsetHeight;
    },
    SetWidth: function (width) {
      if (this.sizingConfig.allowSetWidth)
        this.SetSizeCore("width", width, "GetWidth", false);
    },
    SetHeight: function (height) {
      if (this.sizingConfig.allowSetHeight)
        this.SetSizeCore("height", height, "GetHeight", false);
    },
    SetSizeCore: function (sizePropertyName, size, getFunctionName, corrected) {
      if (size < 0) return;
      this.GetMainElement().style[sizePropertyName] = size + "px";
      this.UpdateAdjustmentFlags(sizePropertyName);
      if (this.sizingConfig.adjustControl) this.AdjustControl(true);
      if (this.sizingConfig.correction && !corrected) {
        var realSize = this[getFunctionName]();
        if (realSize != size) {
          var correctedSize = size - (realSize - size);
          this.SetSizeCore(
            sizePropertyName,
            correctedSize,
            getFunctionName,
            true
          );
        }
      }
    },
    AdjustControl: function (nestedCall) {
      if (
        this.IsAdjustmentRequired() &&
        (!ASPxClientControl.adjustControlLocked || nestedCall)
      ) {
        ASPxClientControl.adjustControlLocked = true;
        try {
          if (!this.IsAdjustmentAllowed()) return;
          this.AdjustControlCore();
          this.UpdateAdjustedSizes();
        } finally {
          delete ASPxClientControl.adjustControlLocked;
        }
      }
      this.TryShowPhantomLoadingElements();
    },
    ResetControlAdjustment: function () {
      this.adjustedSizes = {};
    },
    UpdateAdjustmentFlags: function (sizeProperty) {
      var mainElement = this.GetMainElement();
      if (mainElement) {
        var mainElementStyle = ASPx.GetCurrentStyle(mainElement);
        this.UpdatePercentSizeConfig(
          [mainElementStyle.width, mainElement.style.width],
          [mainElementStyle.height, mainElement.style.height],
          sizeProperty
        );
      }
    },
    UpdatePercentSizeConfig: function (widths, heights, modifyStyleProperty) {
      switch (modifyStyleProperty) {
        case "width":
          this.UpdatePercentWidthConfig(widths);
          break;
        case "height":
          this.UpdatePercentHeightConfig(heights);
          break;
        default:
          this.UpdatePercentWidthConfig(widths);
          this.UpdatePercentHeightConfig(heights);
          break;
      }
      this.ResetControlPercentMarkerSize();
    },
    UpdatePercentWidthConfig: function (widths) {
      this.widthValueSetInPercentage = false;
      for (var i = 0; i < widths.length; i++) {
        if (ASPx.IsPercentageSize(widths[i])) {
          this.percentSizeConfig.width = widths[i];
          this.widthValueSetInPercentage = true;
          break;
        }
      }
    },
    UpdatePercentHeightConfig: function (heights) {
      this.heightValueSetInPercentage = false;
      for (var i = 0; i < heights.length; i++) {
        if (ASPx.IsPercentageSize(heights[i])) {
          this.percentSizeConfig.height = heights[i];
          this.heightValueSetInPercentage = true;
          break;
        }
      }
    },
    GetAdjustedSizes: function () {
      var mainElement = this.GetMainElement();
      if (mainElement)
        return {
          width: mainElement.offsetWidth,
          height: mainElement.offsetHeight,
        };
      return { width: 0, height: 0 };
    },
    IsAdjusted: function () {
      return (
        this.adjustedSizes.width &&
        this.adjustedSizes.width > 0 &&
        this.adjustedSizes.height &&
        this.adjustedSizes.height > 0
      );
    },
    IsAdjustmentRequired: function () {
      if (!this.IsAdjusted()) return true;
      if (this.widthValueSetInPercentage) return true;
      if (this.heightValueSetInPercentage) return true;
      var sizes = this.GetAdjustedSizes();
      for (var name in sizes) {
        if (this.adjustedSizes[name] !== sizes[name]) return true;
      }
      return false;
    },
    IsAdjustmentAllowed: function () {
      var mainElement = this.GetMainElement();
      return (
        mainElement &&
        this.IsDisplayed() &&
        !this.IsHidden() &&
        this.IsDOMInitialized()
      );
    },
    UpdateAdjustedSizes: function () {
      var sizes = this.GetAdjustedSizes();
      for (var name in sizes) this.adjustedSizes[name] = sizes[name];
    },
    AdjustControlCore: function () {},
    AdjustAutoHeight: function () {},
    IsControlCollapsed: function () {
      return this.isControlCollapsed;
    },
    NeedCollapseControl: function () {
      return (
        this.NeedCollapseControlCore() &&
        this.IsAdjustmentRequired() &&
        this.IsAdjustmentAllowed()
      );
    },
    NeedCollapseControlCore: function () {
      return false;
    },
    CollapseEditor: function () {},
    CollapseControl: function () {
      this.SaveScrollPositions();
      var mainElement = this.GetMainElement(),
        marker = this.GetControlPercentSizeMarker();
      marker.style.height =
        this.heightValueSetInPercentage &&
        this.sizingConfig.supportPercentHeight
          ? this.percentSizeConfig.height
          : mainElement.offsetHeight + "px";
      mainElement.style.display = "none";
      this.isControlCollapsed = true;
    },
    ExpandControl: function () {
      var mainElement = this.GetMainElement();
      mainElement.style.display = "";
      this.GetControlPercentSizeMarker().style.height = "0px";
      this.isControlCollapsed = false;
      this.RestoreScrollPositions();
    },
    CanCauseReadjustment: function () {
      return this.NeedCollapseControlCore();
    },
    IsExpandableByAdjustment: function () {
      return false;
    },
    HasFixedPosition: function () {
      return false;
    },
    SaveScrollPositions: function () {
      var mainElement = this.GetMainElement();
      this.scrollPositionState.outer = ASPx.GetOuterScrollPosition(
        mainElement.parentNode
      );
      this.scrollPositionState.inner =
        ASPx.GetInnerScrollPositions(mainElement);
    },
    RestoreScrollPositions: function () {
      ASPx.RestoreOuterScrollPosition(this.scrollPositionState.outer);
      ASPx.RestoreInnerScrollPositions(this.scrollPositionState.inner);
    },
    GetControlPercentSizeMarker: function () {
      if (this.percentSizeMarker === undefined) {
        this.percentSizeMarker = ASPx.CreateHtmlElementFromString(
          "<div style='height:0px;font-size:0px;line-height:0;width:100%;'></div>"
        );
        ASPx.InsertElementAfter(this.percentSizeMarker, this.GetMainElement());
      }
      return this.percentSizeMarker;
    },
    KeepControlPercentSizeMarker: function (needCollapse, needCalculateHeight) {
      var mainElement = this.GetMainElement(),
        marker = this.GetControlPercentSizeMarker(),
        markerHeight;
      if (needCollapse) this.CollapseControl();
      if (
        this.widthValueSetInPercentage &&
        marker.style.width !== this.percentSizeConfig.width
      )
        marker.style.width = this.percentSizeConfig.width;
      if (needCalculateHeight) {
        if (this.IsControlCollapsed()) markerHeight = marker.style.height;
        marker.style.height = this.percentSizeConfig.height;
      }
      this.percentSizeConfig.markerWidth = marker.offsetWidth;
      if (needCalculateHeight) {
        this.percentSizeConfig.markerHeight = marker.offsetHeight;
        if (this.IsControlCollapsed()) marker.style.height = markerHeight;
        else marker.style.height = "0px";
      }
      if (needCollapse) this.ExpandControl();
    },
    ResetControlPercentMarkerSize: function () {
      this.percentSizeConfig.markerWidth = -1;
      this.percentSizeConfig.markerHeight = -1;
    },
    GetControlPercentMarkerSize: function (hideControl, force) {
      var needCalculateHeight =
        this.heightValueSetInPercentage &&
        this.sizingConfig.supportPercentHeight;
      if (
        force ||
        this.percentSizeConfig.markerWidth < 1 ||
        (needCalculateHeight && this.percentSizeConfig.markerHeight < 1)
      )
        this.KeepControlPercentSizeMarker(
          hideControl && !this.IsControlCollapsed(),
          needCalculateHeight
        );
      return {
        width: this.percentSizeConfig.markerWidth,
        height: this.percentSizeConfig.markerHeight,
      };
    },
    AssignEllipsisToolTips: function () {
      if (this.RequireAssignToolTips()) this.AssignEllipsisToolTipsCore();
    },
    AssignEllipsisToolTipsCore: function () {
      var requirePaddingManipulation = ASPx.Browser.IE || ASPx.Browser.Firefox;
      var ellipsisNodes = ASPx.GetNodesByClassName(
        this.GetMainElement(),
        "dx-ellipsis"
      );
      var nodeInfos = [];
      var nodesCount = ellipsisNodes.length;
      for (var i = 0; i < nodesCount; i++) {
        var node = ellipsisNodes[i];
        var info = { node: node };
        if (requirePaddingManipulation) {
          var style = ASPx.GetCurrentStyle(node);
          info.paddingLeft = node.style.paddingLeft;
          info.totalPadding = ASPx.GetLeftRightPaddings(node, style);
        }
        nodeInfos.push(info);
      }
      if (requirePaddingManipulation) {
        for (var i = 0; i < nodesCount; i++) {
          var info = nodeInfos[i];
          ASPx.SetStyles(info.node, { paddingLeft: info.totalPadding }, true);
        }
      }
      for (var i = 0; i < nodesCount; i++) {
        var info = nodeInfos[i];
        var node = info.node;
        info.isTextShortened = node.scrollWidth > node.clientWidth;
        info.hasTitle = !!node.title;
        info.title = !info.hasTitle && ASPx.GetInnerText(node);
      }
      for (var i = 0; i < nodesCount; i++) {
        var info = nodeInfos[i];
        var node = info.node;
        if (info.isTextShortened && !info.hasTitle) node.title = info.title;
        if (!info.isTextShortened && info.hasTitle)
          node.removeAttribute("title");
      }
      if (requirePaddingManipulation) {
        for (var i = 0; i < nodesCount; i++) {
          var info = nodeInfos[i];
          var node = info.node;
          node.style.paddingLeft = info.paddingLeft;
        }
      }
    },
    AssignEllipsisToolTip: function (elem) {
      var isTextShortened = elem.scrollWidth > elem.clientWidth;
      if (isTextShortened && !elem.title) elem.title = ASPx.GetInnerText(elem);
      if (!isTextShortened && elem.title) elem.removeAttribute("title");
    },
    RequireAssignToolTips: function () {
      return this.enableEllipsis && !ASPx.Browser.TouchUI;
    },
    OnPost: function (args) {
      this.UpdateStateObject();
      if (this.stateObject != null) this.UpdateStateHiddenField();
    },
    OnPostFinalization: function (args) {},
    UpdateStateObject: function () {},
    UpdateStateObjectWithObject: function (obj) {
      if (!obj) return;
      if (!this.stateObject) this.stateObject = {};
      for (var key in obj) this.stateObject[key] = obj[key];
    },
    UpdateStateHiddenField: function () {
      var stateHiddenField = this.GetStateHiddenField();
      if (stateHiddenField) {
        var stateObjectStr = ASPx.Json.ToJson(this.stateObject);
        stateHiddenField.value = ASPx.Str.EncodeHtml(stateObjectStr);
      }
    },
    GetStateHiddenField: function () {
      return this.GetHiddenField(
        this.GetStateHiddenFieldName(),
        this.name + "_State",
        this.GetStateHiddenFieldParent(),
        this.GetStateHiddenFieldOrigin()
      );
    },
    GetStateHiddenFieldName: function () {
      return this.uniqueID;
    },
    GetStateHiddenFieldOrigin: function () {
      return this.GetMainElement();
    },
    GetStateHiddenFieldParent: function () {
      var element = this.GetStateHiddenFieldOrigin();
      return element ? element.parentNode : null;
    },
    GetHiddenField: function (name, id, parent, beforeElement) {
      var hiddenField = this.hiddenFields[id];
      if (!hiddenField || !ASPx.IsValidElement(hiddenField)) {
        if (parent) {
          this.hiddenFields[id] = hiddenField = ASPx.CreateHiddenField(
            name,
            id
          );
          if (beforeElement) parent.insertBefore(hiddenField, beforeElement);
          else parent.appendChild(hiddenField);
        }
      }
      return hiddenField;
    },
    OnBrowserWindowResize: function (evt) {},
    OnBrowserWindowResizeInternal: function (evt) {
      if (this.BrowserWindowResizeSubscriber()) this.OnBrowserWindowResize(evt);
    },
    BrowserWindowResizeSubscriber: function () {
      return this.widthValueSetInPercentage;
    },
    ShrinkWrappedText: function (getElements, key, reCorrect) {
      if (!ASPx.Browser.Safari) return;
      var elements = CacheHelper.GetCachedElements(
        this,
        key,
        getElements,
        this.wrappedTextContainers
      );
      for (var i = 0; i < elements.length; i++)
        this.ShrinkWrappedTextInContainer(elements[i], reCorrect);
    },
    ShrinkWrappedTextInContainer: function (container, reCorrect) {
      if (
        !ASPx.Browser.Safari ||
        !container ||
        (container.dxWrappedTextShrinked && !reCorrect) ||
        container.offsetWidth === 0
      )
        return;
      ASPx.ShrinkWrappedTextInContainer(container);
      container.dxWrappedTextShrinked = true;
    },
    CorrectWrappedText: function (getElements, key, reCorrect) {
      var elements = CacheHelper.GetCachedElements(
        this,
        key,
        getElements,
        this.wrappedTextContainers
      );
      for (var i = 0; i < elements.length; i++)
        this.CorrectWrappedTextInContainer(elements[i], reCorrect);
    },
    CorrectWrappedTextInContainer: function (container, reCorrect) {
      if (
        !container ||
        (container.dxWrappedTextCorrected && !reCorrect) ||
        container.offsetWidth === 0
      )
        return;
      ASPx.AdjustWrappedTextInContainer(container);
      container.dxWrappedTextCorrected = true;
    },
    CorrectVerticalAlignment: function (
      alignMethod,
      getElements,
      key,
      reAlign
    ) {
      var elements = CacheHelper.GetCachedElements(
        this,
        key,
        getElements,
        this.verticalAlignedElements
      );
      for (var i = 0; i < elements.length; i++)
        this.CorrectElementVerticalAlignment(alignMethod, elements[i], reAlign);
    },
    CorrectElementVerticalAlignment: function (alignMethod, element, reAlign) {
      if (
        !element ||
        (element.dxVerticalAligned && !reAlign) ||
        element.offsetHeight === 0
      )
        return;
      alignMethod(element);
      element.dxVerticalAligned = true;
    },
    ClearVerticalAlignedElementsCache: function () {
      CacheHelper.DropCache(this.verticalAlignedElements);
    },
    ClearWrappedTextContainersCache: function () {
      CacheHelper.DropCache(this.wrappedTextContainers);
    },
    AdjustPagerControls: function () {
      if (typeof ASPx.GetPagersCollection != "undefined")
        ASPx.GetPagersCollection().AdjustControls(this.GetMainElement());
    },
    RegisterInControlTree: function (tree) {
      var mainElement = this.GetMainElement();
      if (mainElement && mainElement.id) tree.createNode(mainElement.id, this);
    },
    RegisterServerEventAssigned: function (eventNames) {
      for (var i = 0; i < eventNames.length; i++)
        this.serverEvents[eventNames[i]] = true;
    },
    IsServerEventAssigned: function (eventName) {
      return !!this.serverEvents[eventName];
    },
    GetChildElement: function (idPostfix) {
      var mainElement = this.GetMainElement();
      if (idPostfix.charAt && idPostfix.charAt(0) !== "_")
        idPostfix = "_" + idPostfix;
      return mainElement
        ? CacheHelper.GetCachedChildById(
            this,
            mainElement,
            this.name + idPostfix
          )
        : null;
    },
    getChildControl: function (idPostfix) {
      var result = null;
      var childControlId = this.getChildControlUniqueID(idPostfix);
      ASPx.GetControlCollection().ProcessControlsInContainer(
        this.GetMainElement(),
        function (control) {
          if (control.uniqueID == childControlId) result = control;
        }
      );
      return result;
    },
    getChildControlUniqueID: function (idPostfix) {
      idPostfix = idPostfix.split("_").join("$");
      if (idPostfix.charAt && idPostfix.charAt(0) !== "$")
        idPostfix = "$" + idPostfix;
      return this.uniqueID + idPostfix;
    },
    GetItemElementName: function (element) {
      var name = "";
      if (element.id) name = element.id.substring(this.name.length + 1);
      return name;
    },
    GetLinkElement: function (element) {
      if (element == null) return null;
      return element.tagName == "A"
        ? element
        : ASPx.GetNodeByTagName(element, "A", 0);
    },
    GetInternalHyperlinkElement: function (parentElement, index) {
      var element = ASPx.GetNodeByTagName(parentElement, "A", index);
      if (element == null)
        element = ASPx.GetNodeByTagName(parentElement, "SPAN", index);
      return element;
    },
    GetParentForm: function () {
      return ASPx.GetParentByTagName(this.GetMainElement(), "FORM");
    },
    GetMainElement: function () {
      if (!ASPx.IsExistsElement(this.mainElement))
        this.mainElement = ASPx.GetElementById(this.name);
      return this.mainElement;
    },
    OnControlClick: function (clickedElement, htmlEvent) {},
    IsLoadingContainerVisible: function () {
      return this.IsVisible();
    },
    GetLoadingPanelElement: function () {
      return ASPx.GetElementById(this.name + "_LP");
    },
    GetClonedLoadingPanel: function () {
      return document.getElementById(this.GetLoadingPanelElement().id + "V");
    },
    CloneLoadingPanel: function (element, parent) {
      var clone = element.cloneNode(true);
      clone.id = element.id + "V";
      parent.appendChild(clone);
      return clone;
    },
    CreateLoadingPanelWithoutBordersInsideContainer: function (container) {
      var loadingPanel = this.CreateLoadingPanelInsideContainer(
        container,
        false,
        true,
        true
      );
      var contentStyle = ASPx.GetCurrentStyle(container);
      if (!loadingPanel || !contentStyle) return;
      var elements = [];
      elements.push(
        loadingPanel.tagName == "TABLE"
          ? loadingPanel
          : ASPx.GetNodeByTagName(loadingPanel, "TABLE", 0)
      );
      var cells = ASPx.GetNodesByTagName(loadingPanel, "TD");
      if (!cells) cells = [];
      for (var i = 0; i < cells.length; i++) elements.push(cells[i]);
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        el.style.backgroundColor = contentStyle.backgroundColor;
        ASPx.RemoveBordersAndShadows(el);
      }
    },
    CreateLoadingPanelInsideContainer: function (
      parentElement,
      hideContent,
      collapseHeight,
      collapseWidth
    ) {
      if (this.ShouldHideExistingLoadingElements()) this.HideLoadingPanel();
      if (parentElement == null) return null;
      if (!this.IsLoadingContainerVisible()) {
        this.hasPhantomLoadingElements = true;
        return null;
      }
      var element = this.GetLoadingPanelElement();
      if (element != null) {
        var width = collapseWidth ? 0 : ASPx.GetClearClientWidth(parentElement);
        var height = collapseHeight
          ? 0
          : ASPx.GetClearClientHeight(parentElement);
        if (hideContent) {
          for (var i = parentElement.childNodes.length - 1; i > -1; i--) {
            if (parentElement.childNodes[i].style)
              parentElement.childNodes[i].style.display = "none";
            else if (parentElement.childNodes[i].nodeType == 3)
              parentElement.removeChild(parentElement.childNodes[i]);
          }
        } else parentElement.innerHTML = "";
        var table = document.createElement("TABLE");
        parentElement.appendChild(table);
        table.border = 0;
        table.cellPadding = 0;
        table.cellSpacing = 0;
        ASPx.SetStyles(table, {
          width: width > 0 ? width : "100%",
          height: height > 0 ? height : "100%",
        });
        var tbody = document.createElement("TBODY");
        table.appendChild(tbody);
        var tr = document.createElement("TR");
        tbody.appendChild(tr);
        var td = document.createElement("TD");
        tr.appendChild(td);
        td.align = "center";
        td.vAlign = "middle";
        element = this.CloneLoadingPanel(element, td);
        ASPx.SetElementDisplay(element, true);
        this.loadingPanelElement = element;
        return element;
      } else parentElement.innerHTML = "&nbsp;";
      return null;
    },
    CreateLoadingPanelWithAbsolutePosition: function (
      parentElement,
      offsetElement
    ) {
      if (this.ShouldHideExistingLoadingElements()) this.HideLoadingPanel();
      if (parentElement == null) return null;
      if (!this.IsLoadingContainerVisible()) {
        this.hasPhantomLoadingElements = true;
        return null;
      }
      if (!offsetElement) offsetElement = parentElement;
      var element = this.GetLoadingPanelElement();
      if (element != null) {
        element = this.CloneLoadingPanel(element, parentElement);
        ASPx.SetStyles(element, {
          position: "absolute",
          display: "",
        });
        this.SetLoadingPanelLocation(offsetElement, element);
        this.loadingPanelElement = element;
        return element;
      }
      return null;
    },
    CreateLoadingPanelInline: function (parentElement) {
      if (this.ShouldHideExistingLoadingElements()) this.HideLoadingPanel();
      if (parentElement == null) return null;
      if (!this.IsLoadingContainerVisible()) {
        this.hasPhantomLoadingElements = true;
        return null;
      }
      var element = this.GetLoadingPanelElement();
      if (element != null) {
        element = this.CloneLoadingPanel(element, parentElement);
        ASPx.SetElementDisplay(element, true);
        this.loadingPanelElement = element;
        return element;
      }
      return null;
    },
    ShowLoadingPanel: function () {},
    ShowLoadingElements: function () {
      if (this.InCallback() || this.lpTimer > -1) return;
      this.ShowLoadingDiv();
      if (this.IsCallbackAnimationEnabled()) this.StartBeginCallbackAnimation();
      else this.ShowLoadingElementsInternal();
    },
    ShowLoadingElementsInternal: function () {
      if (this.lpDelay > 0 && !this.IsCallbackAnimationEnabled())
        this.lpTimer = window.setTimeout(
          function () {
            this.ShowLoadingPanelOnTimer();
          }.aspxBind(this),
          this.lpDelay
        );
      else {
        this.RestoreLoadingDivOpacity();
        this.ShowLoadingPanel();
      }
    },
    GetLoadingPanelOffsetElement: function (baseElement) {
      if (this.IsCallbackAnimationEnabled()) {
        var element = this.GetLoadingPanelCallbackAnimationOffsetElement();
        if (element) {
          var container =
            typeof ASPx.AnimationHelper != "undefined"
              ? ASPx.AnimationHelper.findSlideAnimationContainer(element)
              : null;
          if (container) return container.parentNode.parentNode;
          else return element;
        }
      }
      return baseElement;
    },
    GetLoadingPanelCallbackAnimationOffsetElement: function () {
      return this.GetCallbackAnimationElement();
    },
    IsCallbackAnimationEnabled: function () {
      return (
        (this.enableCallbackAnimation || this.enableSlideCallbackAnimation) &&
        !this.isCallbackAnimationPrevented
      );
    },
    GetDefaultanimationEngineType: function () {
      return ASPx.AnimationEngineType.DEFAULT;
    },
    StartBeginCallbackAnimation: function () {
      this.beginCallbackAnimationProcessing = true;
      this.isCallbackFinished = false;
      var element = this.GetCallbackAnimationElement();
      if (
        element &&
        this.enableSlideCallbackAnimation &&
        this.slideAnimationDirection
      )
        ASPx.AnimationHelper.slideOut(
          element,
          this.slideAnimationDirection,
          this.FinishBeginCallbackAnimation.aspxBind(this),
          this.GetDefaultanimationEngineType()
        );
      else if (element && this.enableCallbackAnimation)
        ASPx.AnimationHelper.fadeOut(
          element,
          this.FinishBeginCallbackAnimation.aspxBind(this)
        );
      else this.FinishBeginCallbackAnimation();
    },
    CancelBeginCallbackAnimation: function () {
      if (this.beginCallbackAnimationProcessing) {
        this.beginCallbackAnimationProcessing = false;
        var element = this.GetCallbackAnimationElement();
        ASPx.AnimationHelper.cancelAnimation(element);
      }
    },
    FinishBeginCallbackAnimation: function () {
      this.beginCallbackAnimationProcessing = false;
      if (!this.isCallbackFinished) this.ShowLoadingElementsInternal();
      else {
        this.DoCallback(this.savedCallbackResult);
        this.savedCallbackResult = null;
      }
    },
    CheckBeginCallbackAnimationInProgress: function (callbackResult) {
      if (this.beginCallbackAnimationProcessing) {
        this.savedCallbackResult = callbackResult;
        this.isCallbackFinished = true;
        return true;
      }
      return false;
    },
    StartEndCallbackAnimation: function () {
      this.HideLoadingPanel();
      this.SetInitialLoadingDivOpacity();
      this.RaiseEndCallbackAnimationStart();
      this.endCallbackAnimationProcessing = true;
      var element = this.GetCallbackAnimationElement();
      if (
        element &&
        this.enableSlideCallbackAnimation &&
        this.slideAnimationDirection
      )
        ASPx.AnimationHelper.slideIn(
          element,
          this.slideAnimationDirection,
          this.FinishEndCallbackAnimation.aspxBind(this),
          this.GetDefaultanimationEngineType()
        );
      else if (element && this.enableCallbackAnimation)
        ASPx.AnimationHelper.fadeIn(
          element,
          this.FinishEndCallbackAnimation.aspxBind(this)
        );
      else this.FinishEndCallbackAnimation();
      this.slideAnimationDirection = null;
    },
    FinishEndCallbackAnimation: function () {
      this.DoEndCallback();
      this.endCallbackAnimationProcessing = false;
      this.CheckRepeatGesture();
    },
    CheckEndCallbackAnimationNeeded: function () {
      if (!this.endCallbackAnimationProcessing && this.requestCount == 1) {
        this.StartEndCallbackAnimation();
        return true;
      }
      return false;
    },
    PreventCallbackAnimation: function () {
      this.isCallbackAnimationPrevented = true;
    },
    GetCallbackAnimationElement: function () {
      return null;
    },
    AssignSlideAnimationDirectionByPagerArgument: function (
      arg,
      currentPageIndex
    ) {
      this.slideAnimationDirection = null;
      if (
        this.enableSlideCallbackAnimation &&
        typeof ASPx.AnimationHelper != "undefined"
      ) {
        if (arg == PagerCommands.Next || arg == PagerCommands.Last)
          this.slideAnimationDirection =
            ASPx.AnimationHelper.SLIDE_LEFT_DIRECTION;
        else if (arg == PagerCommands.First || arg == PagerCommands.Prev)
          this.slideAnimationDirection =
            ASPx.AnimationHelper.SLIDE_RIGHT_DIRECTION;
        else if (
          !isNaN(currentPageIndex) &&
          arg.indexOf(PagerCommands.PageNumber) == 0
        ) {
          var newPageIndex = parseInt(arg.substring(2));
          if (!isNaN(newPageIndex))
            this.slideAnimationDirection =
              newPageIndex < currentPageIndex
                ? ASPx.AnimationHelper.SLIDE_RIGHT_DIRECTION
                : ASPx.AnimationHelper.SLIDE_LEFT_DIRECTION;
        }
      }
    },
    TryShowPhantomLoadingElements: function () {
      if (this.hasPhantomLoadingElements && this.InCallback()) {
        this.hasPhantomLoadingElements = false;
        this.ShowLoadingDivAndPanel();
      }
    },
    ShowLoadingDivAndPanel: function () {
      this.ShowLoadingDiv();
      this.RestoreLoadingDivOpacity();
      this.ShowLoadingPanel();
    },
    HideLoadingElements: function () {
      this.CancelBeginCallbackAnimation();
      this.HideLoadingPanel();
      this.HideLoadingDiv();
    },
    ShowLoadingPanelOnTimer: function () {
      this.ClearLoadingPanelTimer();
      if (!this.IsDOMDisposed()) {
        this.RestoreLoadingDivOpacity();
        this.ShowLoadingPanel();
      }
    },
    ClearLoadingPanelTimer: function () {
      this.lpTimer = ASPx.Timer.ClearTimer(this.lpTimer);
    },
    HideLoadingPanel: function () {
      this.ClearLoadingPanelTimer();
      this.hasPhantomLoadingElements = false;
      if (ASPx.IsExistsElement(this.loadingPanelElement)) {
        ASPx.RemoveElement(this.loadingPanelElement);
        this.loadingPanelElement = null;
      }
    },
    SetLoadingPanelLocation: function (
      offsetElement,
      loadingPanel,
      x,
      y,
      offsetX,
      offsetY
    ) {
      if (!ASPx.IsExists(x) || !ASPx.IsExists(y)) {
        var x1 = ASPx.GetAbsoluteX(offsetElement);
        var y1 = ASPx.GetAbsoluteY(offsetElement);
        var x2 = x1;
        var y2 = y1;
        if (offsetElement == document.body) {
          x2 += ASPx.GetDocumentMaxClientWidth();
          y2 += ASPx.GetDocumentMaxClientHeight();
        } else {
          x2 += offsetElement.offsetWidth;
          y2 += offsetElement.offsetHeight;
        }
        if (x1 < ASPx.GetDocumentScrollLeft())
          x1 = ASPx.GetDocumentScrollLeft();
        if (y1 < ASPx.GetDocumentScrollTop()) y1 = ASPx.GetDocumentScrollTop();
        if (x2 > ASPx.GetDocumentScrollLeft() + ASPx.GetDocumentClientWidth())
          x2 = ASPx.GetDocumentScrollLeft() + ASPx.GetDocumentClientWidth();
        if (y2 > ASPx.GetDocumentScrollTop() + ASPx.GetDocumentClientHeight())
          y2 = ASPx.GetDocumentScrollTop() + ASPx.GetDocumentClientHeight();
        x = x1 + (x2 - x1 - loadingPanel.offsetWidth) / 2;
        y = y1 + (y2 - y1 - loadingPanel.offsetHeight) / 2;
      }
      if (ASPx.IsExists(offsetX) && ASPx.IsExists(offsetY)) {
        x += offsetX;
        y += offsetY;
      }
      x = ASPx.PrepareClientPosForElement(x, loadingPanel, true);
      y = ASPx.PrepareClientPosForElement(y, loadingPanel, false);
      if (
        ASPx.Browser.IE &&
        ASPx.Browser.Version > 8 &&
        y - Math.floor(y) === 0.5
      )
        y = Math.ceil(y);
      ASPx.SetStyles(loadingPanel, { left: x, top: y });
    },
    GetLoadingDiv: function () {
      return ASPx.GetElementById(this.name + "_LD");
    },
    CreateLoadingDiv: function (parentElement, offsetElement) {
      if (this.ShouldHideExistingLoadingElements()) this.HideLoadingDiv();
      if (parentElement == null) return null;
      if (!this.IsLoadingContainerVisible()) {
        this.hasPhantomLoadingElements = true;
        return null;
      }
      if (!offsetElement) offsetElement = parentElement;
      var div = this.GetLoadingDiv();
      if (div != null) {
        div = div.cloneNode(true);
        parentElement.appendChild(div);
        ASPx.SetElementDisplay(div, true);
        ASPx.Evt.AttachEventToElement(
          div,
          TouchUIHelper.touchMouseDownEventName,
          ASPx.Evt.PreventEvent
        );
        ASPx.Evt.AttachEventToElement(
          div,
          TouchUIHelper.touchMouseMoveEventName,
          ASPx.Evt.PreventEvent
        );
        ASPx.Evt.AttachEventToElement(
          div,
          TouchUIHelper.touchMouseUpEventName,
          ASPx.Evt.PreventEvent
        );
        this.SetLoadingDivBounds(offsetElement, div);
        this.loadingDivElement = div;
        this.SetInitialLoadingDivOpacity();
        return div;
      }
      return null;
    },
    SetInitialLoadingDivOpacity: function () {
      if (!this.loadingDivElement) return;
      ASPx.Attr.SaveStyleAttribute(this.loadingDivElement, "opacity");
      ASPx.Attr.SaveStyleAttribute(this.loadingDivElement, "filter");
      ASPx.SetElementOpacity(this.loadingDivElement, 0.01);
    },
    RestoreLoadingDivOpacity: function () {
      if (!this.loadingDivElement) return;
      ASPx.Attr.RestoreStyleAttribute(this.loadingDivElement, "opacity");
      ASPx.Attr.RestoreStyleAttribute(this.loadingDivElement, "filter");
    },
    SetLoadingDivBounds: function (offsetElement, loadingDiv) {
      var absX =
        offsetElement == document.body ? 0 : ASPx.GetAbsoluteX(offsetElement);
      var absY =
        offsetElement == document.body ? 0 : ASPx.GetAbsoluteY(offsetElement);
      ASPx.SetStyles(loadingDiv, {
        left: ASPx.PrepareClientPosForElement(absX, loadingDiv, true),
        top: ASPx.PrepareClientPosForElement(absY, loadingDiv, false),
      });
      var width =
        offsetElement == document.body
          ? ASPx.GetDocumentWidth()
          : offsetElement.offsetWidth;
      var height =
        offsetElement == document.body
          ? ASPx.GetDocumentHeight()
          : offsetElement.offsetHeight;
      if (height < 0) height = 0;
      ASPx.SetStyles(loadingDiv, { width: width, height: height });
      var correctedWidth = 2 * width - loadingDiv.offsetWidth;
      if (correctedWidth <= 0) correctedWidth = width;
      var correctedHeight = 2 * height - loadingDiv.offsetHeight;
      if (correctedHeight <= 0) correctedHeight = height;
      ASPx.SetStyles(loadingDiv, {
        width: correctedWidth,
        height: correctedHeight,
      });
    },
    ShowLoadingDiv: function () {},
    HideLoadingDiv: function () {
      this.hasPhantomLoadingElements = false;
      if (ASPx.IsExistsElement(this.loadingDivElement)) {
        ASPx.RemoveElement(this.loadingDivElement);
        this.loadingDivElement = null;
      }
    },
    CanHandleGesture: function (evt) {
      return false;
    },
    CanHandleGestureCore: function (evt) {
      var source = ASPx.Evt.GetEventSource(evt);
      if (
        ASPx.GetIsParent(this.loadingPanelElement, source) ||
        ASPx.GetIsParent(this.loadingDivElement, source)
      )
        return true;
      var callbackAnimationElement = this.GetCallbackAnimationElement();
      if (!callbackAnimationElement) return false;
      var animationContainer = ASPx.AnimationHelper.getSlideAnimationContainer(
        callbackAnimationElement,
        false,
        false
      );
      if (
        animationContainer &&
        ASPx.GetIsParent(animationContainer, source) &&
        !ASPx.GetIsParent(animationContainer.childNodes[0], source)
      )
        return true;
      return this.CanHandleGesture(evt);
    },
    AllowStartGesture: function () {
      return (
        !this.beginCallbackAnimationProcessing &&
        !this.endCallbackAnimationProcessing
      );
    },
    StartGesture: function () {},
    AllowExecuteGesture: function (value) {
      return false;
    },
    ExecuteGesture: function (value) {},
    CancelGesture: function (value) {
      if (this.repeatedGestureCount === 0) {
        this.repeatedGestureValue = value;
        this.repeatedGestureCount = 1;
      } else {
        if (this.repeatedGestureValue * value > 0) this.repeatedGestureCount++;
        else this.repeatedGestureCount--;
        if (this.repeatedGestureCount === 0) this.repeatedGestureCount = 0;
      }
    },
    CheckRepeatGesture: function () {
      if (this.repeatedGestureCount !== 0) {
        if (this.AllowExecuteGesture(this.repeatedGestureValue))
          this.ExecuteGesture(
            this.repeatedGestureValue,
            this.repeatedGestureCount
          );
        this.repeatedGestureValue = 0;
        this.repeatedGestureCount = 0;
      }
    },
    AllowExecutePagerGesture: function (pageIndex, pageCount, value) {
      if (pageIndex < 0) return false;
      if (pageCount <= 1) return false;
      if (value > 0 && pageIndex === 0) return false;
      if (value < 0 && pageIndex === pageCount - 1) return false;
      return true;
    },
    ExecutePagerGesture: function (pageIndex, pageCount, value, count, method) {
      if (!count) count = 1;
      var pageIndex = pageIndex + (value < 0 ? count : -count);
      if (pageIndex < 0) pageIndex = 0;
      if (pageIndex > pageCount - 1) pageIndex = pageCount - 1;
      method(PagerCommands.PageNumber + pageIndex);
    },
    RaiseInit: function () {
      if (!this.Init.IsEmpty()) {
        var args = new ASPxClientEventArgs();
        this.Init.FireEvent(this, args);
      }
    },
    RaiseBeginCallbackInternal: function (command) {
      if (!this.BeginCallback.IsEmpty()) {
        var args = new ASPxClientBeginCallbackEventArgs(command);
        this.BeginCallback.FireEvent(this, args);
      }
    },
    RaiseEndCallbackInternal: function () {
      if (!this.EndCallback.IsEmpty()) {
        var args = new ASPxClientEndCallbackEventArgs();
        this.EndCallback.FireEvent(this, args);
      }
    },
    RaiseCallbackErrorInternal: function (message, callbackId) {
      if (!this.CallbackError.IsEmpty()) {
        var args = new ASPxClientCallbackErrorEventArgs(message, callbackId);
        this.CallbackError.FireEvent(this, args);
        if (args.handled)
          return { isHandled: true, errorMessage: args.message };
      }
    },
    RaiseBeginCallback: function (command) {
      this.RaiseBeginCallbackInternal(command);
      aspxGetControlCollection().RaiseBeginCallback(this, command);
    },
    RaiseEndCallback: function () {
      this.RaiseEndCallbackInternal();
      aspxGetControlCollection().RaiseEndCallback(this);
    },
    RaiseCallbackError: function (message, callbackId) {
      var result = this.RaiseCallbackErrorInternal(message, callbackId);
      if (!result)
        result = aspxGetControlCollection().RaiseCallbackError(
          this,
          message,
          callbackId
        );
      return result;
    },
    RaiseEndCallbackAnimationStart: function () {
      if (!this.EndCallbackAnimationStart.IsEmpty()) {
        var args = new ASPxClientEventArgs();
        this.EndCallbackAnimationStart.FireEvent(this, args);
      }
    },
    IsVisible: function () {
      var element = this.GetMainElement();
      return ASPx.IsElementVisible(element);
    },
    IsDisplayedElement: function (element) {
      while (element && element.tagName != "BODY") {
        if (!ASPx.GetElementDisplay(element)) return false;
        element = element.parentNode;
      }
      return true;
    },
    IsDisplayed: function () {
      return this.IsDisplayedElement(this.GetMainElement());
    },
    IsHiddenElement: function (element) {
      return element && element.offsetWidth == 0 && element.offsetHeight == 0;
    },
    IsHidden: function () {
      return this.IsHiddenElement(this.GetMainElement());
    },
    Focus: function () {},
    GetClientVisible: function () {
      return this.GetVisible();
    },
    SetClientVisible: function (visible) {
      this.SetVisible(visible);
    },
    GetVisible: function () {
      return this.clientVisible;
    },
    SetVisible: function (visible) {
      if (this.clientVisible != visible) {
        this.clientVisible = visible;
        ASPx.SetElementDisplay(this.GetMainElement(), visible);
        if (visible) {
          this.AdjustControl();
          var mainElement = this.GetMainElement();
          if (mainElement)
            aspxGetControlCollection().AdjustControls(mainElement);
        }
      }
    },
    GetEnabled: function () {
      return this.clientEnabled;
    },
    SetEnabled: function (enabled) {
      this.clientEnabled = enabled;
      if (ASPxClientControl.setEnabledLocked) return;
      else ASPxClientControl.setEnabledLocked = true;
      this.savedClientEnabled = enabled;
      aspxGetControlCollection().ProcessControlsInContainer(
        this.GetMainElement(),
        function (control) {
          if (ASPx.IsFunction(control.SetEnabled))
            control.SetEnabled(enabled && control.savedClientEnabled);
        }
      );
      delete ASPxClientControl.setEnabledLocked;
    },
    InCallback: function () {
      return this.requestCount > 0;
    },
    DoBeginCallback: function (command) {
      this.RaiseBeginCallback(command || "");
      aspxGetControlCollection().Before_WebForm_InitCallback(this.name);
      if (typeof WebForm_InitCallback != "undefined" && WebForm_InitCallback) {
        __theFormPostData = "";
        __theFormPostCollection = [];
        this.ClearPostBackEventInput("__EVENTTARGET");
        this.ClearPostBackEventInput("__EVENTARGUMENT");
        WebForm_InitCallback();
        this.savedFormPostData = __theFormPostData;
        this.savedFormPostCollection = __theFormPostCollection;
      }
    },
    ClearPostBackEventInput: function (id) {
      var element = ASPx.GetElementById(id);
      if (element != null) element.value = "";
    },
    PerformDataCallback: function (arg, handler) {
      this.CreateCustomDataCallback(arg, "", handler);
    },
    sendCallbackViaQueue: function (
      prefix,
      arg,
      showLoadingPanel,
      context,
      handler
    ) {
      if (!this.useCallbackQueue()) return false;
      var context = context || this;
      var token = this.callbackQueueHelper.sendCallback(
        ASPx.FormatCallbackArg(prefix, arg),
        context,
        handler || context.OnCallback
      );
      if (showLoadingPanel) this.callbackQueueHelper.showLoadingElements();
      return token;
    },
    CreateCallback: function (arg, command) {
      var callbackInfo = this.CreateCallbackInfo(
        ASPx.CallbackType.Common,
        null
      );
      var callbackID = this.CreateCallbackByInfo(arg, command, callbackInfo);
      return callbackID;
    },
    CreateCustomDataCallback: function (arg, command, handler) {
      var callbackInfo = this.CreateCallbackInfo(
        ASPx.CallbackType.Data,
        handler
      );
      this.CreateCallbackByInfo(arg, command, callbackInfo);
    },
    CreateCallbackByInfo: function (arg, command, callbackInfo) {
      if (!this.CanCreateCallback()) return;
      var callbackID;
      if (
        typeof WebForm_DoCallback != "undefined" &&
        WebForm_DoCallback &&
        ASPx.documentLoaded
      )
        callbackID = this.CreateCallbackInternal(
          arg,
          command,
          true,
          callbackInfo
        );
      else {
        if (!this.savedCallbacks) this.savedCallbacks = [];
        var callbackInfo = {
          arg: arg,
          command: command,
          callbackInfo: callbackInfo,
        };
        if (this.allowMultipleCallbacks) this.savedCallbacks.push(callbackInfo);
        else this.savedCallbacks[0] = callbackInfo;
      }
      return callbackID;
    },
    CreateCallbackInternal: function (arg, command, viaTimer, callbackInfo) {
      if (
        ControlUpdateWatcher.Instance &&
        !ControlUpdateWatcher.getInstance().CanSendCallback(this, arg)
      ) {
        this.CancelCallbackInternal();
        return;
      }
      this.requestCount++;
      this.DoBeginCallback(command);
      if (typeof arg == "undefined") arg = "";
      if (typeof command == "undefined") command = "";
      var callbackID = this.SaveCallbackInfo(callbackInfo);
      if (viaTimer)
        window.setTimeout(
          function () {
            this.CreateCallbackCore(arg, command, callbackID);
          }.aspxBind(this),
          0
        );
      else this.CreateCallbackCore(arg, command, callbackID);
      return callbackID;
    },
    CancelCallbackInternal: function () {
      this.CancelCallbackCore();
      this.HideLoadingElements();
    },
    CancelCallbackCore: function () {},
    CreateCallbackCore: function (arg, command, callbackID) {
      var callBackMethod = this.GetCallbackMethod(command);
      __theFormPostData = this.savedFormPostData;
      __theFormPostCollection = this.savedFormPostCollection;
      callBackMethod.call(
        this,
        this.GetSerializedCallbackInfoByID(callbackID) + arg
      );
    },
    GetCallbackMethod: function (command) {
      return this.callBack;
    },
    CanCreateCallback: function () {
      return (
        !this.InCallback() ||
        (this.allowMultipleCallbacks &&
          !this.beginCallbackAnimationProcessing &&
          !this.endCallbackAnimationProcessing)
      );
    },
    DoLoadCallbackScripts: function () {
      _aspxProcessScriptsAndLinks(this.name, true);
    },
    DoEndCallback: function () {
      if (
        this.IsCallbackAnimationEnabled() &&
        this.CheckEndCallbackAnimationNeeded()
      )
        return;
      this.requestCount--;
      if (this.HideLoadingPanelOnCallback() && this.requestCount < 1)
        this.HideLoadingElements();
      if (this.enableSwipeGestures && this.supportGestures) {
        ASPx.GesturesHelper.UpdateSwipeAnimationContainer(this.name);
        if (this.touchUIMouseScroller) this.touchUIMouseScroller.update();
      }
      this.isCallbackAnimationPrevented = false;
      this.OnCallbackFinalized();
      this.RaiseEndCallback();
    },
    DoFinalizeCallback: function () {},
    OnCallbackFinalized: function () {},
    HideLoadingPanelOnCallback: function () {
      return true;
    },
    ShouldHideExistingLoadingElements: function () {
      return true;
    },
    EvalCallbackResult: function (resultString) {
      return eval(resultString);
    },
    DoCallback: function (result) {
      if (
        this.IsCallbackAnimationEnabled() &&
        this.CheckBeginCallbackAnimationInProgress(result)
      )
        return;
      result = ASPx.Str.Trim(result);
      if (result.indexOf(ASPx.CallbackResultPrefix) != 0)
        this.ProcessCallbackGeneralError(result);
      else {
        var resultObj = null;
        try {
          resultObj = this.EvalCallbackResult(result);
        } catch (e) {}
        if (resultObj) {
          CacheHelper.DropCache(this);
          if (resultObj.redirect) {
            if (!ASPx.Browser.IE) window.location.href = resultObj.redirect;
            else {
              var fakeLink = document.createElement("a");
              fakeLink.href = resultObj.redirect;
              document.body.appendChild(fakeLink);
              try {
                fakeLink.click();
              } catch (e) {}
            }
          } else if (ASPx.IsExists(resultObj.generalError)) {
            this.ProcessCallbackGeneralError(resultObj.generalError);
          } else {
            var errorObj = resultObj.error;
            if (errorObj) this.ProcessCallbackError(errorObj, resultObj.id);
            else {
              if (resultObj.cp) {
                for (var name in resultObj.cp) this[name] = resultObj.cp[name];
              }
              var callbackInfo = this.DequeueCallbackInfo(resultObj.id);
              if (callbackInfo && callbackInfo.type == ASPx.CallbackType.Data)
                this.ProcessCustomDataCallback(resultObj.result, callbackInfo);
              else {
                if (
                  this.useCallbackQueue() &&
                  this.callbackQueueHelper.getCallbackInfoById(resultObj.id)
                )
                  this.callbackQueueHelper.processCallback(
                    resultObj.result,
                    resultObj.id
                  );
                else this.ProcessCallback(resultObj.result, resultObj.id);
              }
            }
          }
        }
      }
      this.DoLoadCallbackScripts();
    },
    DoCallbackError: function (result) {
      this.HideLoadingElements();
      this.ProcessCallbackGeneralError(result);
    },
    DoControlClick: function (evt) {
      this.OnControlClick(ASPx.Evt.GetEventSource(evt), evt);
    },
    ProcessCallback: function (result, callbackId) {
      this.OnCallback(result, callbackId);
    },
    ProcessCustomDataCallback: function (result, callbackInfo) {
      if (callbackInfo.handler != null) callbackInfo.handler(this, result);
      this.RaiseCustomDataCallback(result);
    },
    RaiseCustomDataCallback: function (result) {
      if (!this.CustomDataCallback.IsEmpty()) {
        var arg = new ASPxClientCustomDataCallbackEventArgs(result);
        this.CustomDataCallback.FireEvent(this, arg);
      }
    },
    OnCallback: function (result) {},
    CreateCallbackInfo: function (type, handler) {
      return { type: type, handler: handler };
    },
    GetSerializedCallbackInfoByID: function (callbackID) {
      return (
        this.GetCallbackInfoByID(callbackID).type +
        callbackID +
        ASPx.CallbackSeparator
      );
    },
    SaveCallbackInfo: function (callbackInfo) {
      var activeCallbacksInfo = this.GetActiveCallbacksInfo();
      for (var i = 0; i < activeCallbacksInfo.length; i++) {
        if (activeCallbacksInfo[i] == null) {
          activeCallbacksInfo[i] = callbackInfo;
          return i;
        }
      }
      activeCallbacksInfo.push(callbackInfo);
      return activeCallbacksInfo.length - 1;
    },
    GetActiveCallbacksInfo: function () {
      var persistentProperties = this.GetPersistentProperties();
      if (!persistentProperties.activeCallbacks)
        persistentProperties.activeCallbacks = [];
      return persistentProperties.activeCallbacks;
    },
    GetPersistentProperties: function () {
      var storage = _aspxGetPersistentControlPropertiesStorage();
      var persistentProperties = storage[this.name];
      if (!persistentProperties) {
        persistentProperties = {};
        storage[this.name] = persistentProperties;
      }
      return persistentProperties;
    },
    GetCallbackInfoByID: function (callbackID) {
      return this.GetActiveCallbacksInfo()[callbackID];
    },
    DequeueCallbackInfo: function (index) {
      var activeCallbacksInfo = this.GetActiveCallbacksInfo();
      if (index < 0 || index >= activeCallbacksInfo.length) return null;
      var result = activeCallbacksInfo[index];
      activeCallbacksInfo[index] = null;
      return result;
    },
    ProcessCallbackError: function (errorObj, callbackId) {
      var data = ASPx.IsExists(errorObj.data) ? errorObj.data : null;
      var result = this.RaiseCallbackError(errorObj.message, callbackId);
      if (result.isHandled)
        this.OnCallbackErrorAfterUserHandle(result.errorMessage, data);
      else this.OnCallbackError(result.errorMessage, data);
    },
    OnCallbackError: function (errorMessage, data) {
      if (errorMessage) alert(errorMessage);
    },
    OnCallbackErrorAfterUserHandle: function (errorMessage, data) {},
    ProcessCallbackGeneralError: function (errorMessage) {
      var result = this.RaiseCallbackError(errorMessage);
      if (!result.isHandled) this.OnCallbackGeneralError(result.errorMessage);
    },
    OnCallbackGeneralError: function (errorMessage) {
      this.OnCallbackError(errorMessage, null);
    },
    SendPostBack: function (params) {
      if (typeof __doPostBack != "undefined")
        __doPostBack(this.uniqueID, params);
      else {
        var form = this.GetParentForm();
        if (form) form.submit();
      }
    },
    IsValidInstance: function () {
      return aspxGetControlCollection().GetByName(this.name) === this;
    },
    OnDispose: function () {
      var varName = this.globalName;
      if (
        varName &&
        varName !== "" &&
        window &&
        window[varName] &&
        window[varName] == this
      ) {
        try {
          delete window[varName];
        } catch (e) {}
      }
      if (this.callbackQueueHelper) this.callbackQueueHelper.detachEvents();
    },
    OnGlobalControlsInitialized: function (args) {},
    OnGlobalBrowserWindowResized: function (args) {},
    OnGlobalBeginCallback: function (args) {},
    OnGlobalEndCallback: function (args) {},
    OnGlobalCallbackError: function (args) {},
    OnGlobalValidationCompleted: function (args) {},
  });
  ASPxClientControl.AdjustControls = function (container, collapseControls) {
    aspxGetControlCollection().AdjustControls(container, collapseControls);
  };
  ASPxClientControl.Cast = function (obj) {
    if (typeof obj == "string") return window[obj];
    return obj;
  };
  ASPxClientControl.GetControlCollection = function () {
    return aspxGetControlCollection();
  };
  ASPxClientControl.LeadingAfterInitCallConsts = {
    None: 0,
    Direct: 1,
    Reverse: 2,
  };
  var persistentControlPropertiesStorage = null;
  function _aspxGetPersistentControlPropertiesStorage() {
    if (persistentControlPropertiesStorage == null)
      persistentControlPropertiesStorage = {};
    return persistentControlPropertiesStorage;
  }
  function _aspxFunctionIsInCallstack(
    currentCallee,
    targetFunction,
    depthLimit
  ) {
    var candidate = currentCallee;
    var depth = 0;
    while (candidate && depth <= depthLimit) {
      candidate = candidate.caller;
      if (candidate == targetFunction) return true;
      depth++;
    }
    return false;
  }
  function aspxCAInit() {
    var isAppInit =
      typeof Sys$_Application$initialize != "undefined" &&
      _aspxFunctionIsInCallstack(
        arguments.callee,
        Sys$_Application$initialize,
        10
      );
    aspxGetControlCollection().AtlasInitialize(!isAppInit);
  }
  ASPx.Callback = function (result, context) {
    var collection = aspxGetControlCollection();
    collection.DoFinalizeCallback();
    var control = collection.Get(context);
    if (control != null) control.DoCallback(result);
  };
  ASPx.CallbackError = function (result, context) {
    var control = aspxGetControlCollection().Get(context);
    if (control != null) control.DoCallbackError(result, false);
  };
  ASPx.CClick = function (name, evt) {
    var control = aspxGetControlCollection().Get(name);
    if (control != null) control.DoControlClick(evt);
  };
  var ASPxClientComponent = ASPx.CreateClass(ASPxClientControl, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
    },
    IsDOMDisposed: function () {
      return false;
    },
  });
  ASPx.Evt.AttachEventToElement(window, "resize", aspxGlobalWindowResize);
  function aspxGlobalWindowResize(evt) {
    aspxGetControlCollection().OnBrowserWindowResize(evt);
  }
  ASPx.Evt.AttachEventToElement(
    window.document,
    "DOMContentLoaded",
    aspxClassesDOMContentLoaded
  );
  function aspxClassesDOMContentLoaded(evt) {
    aspxGetControlCollection().DOMContentLoaded();
  }
  ASPx.Evt.AttachEventToElement(window, "load", aspxClassesWindowOnLoad);
  function aspxClassesWindowOnLoad(evt) {
    ASPx.documentLoaded = true;
    _aspxSweepDuplicatedLinks();
    ResourceManager.SynchronizeResources();
    aspxGetControlCollection().Initialize();
    _aspxInitializeScripts();
    _aspxInitializeLinks();
    _aspxInitializeFocus();
  }
  Ident = {};
  Ident.IsDate = function (obj) {
    return obj && obj.constructor == Date;
  };
  Ident.IsRegExp = function (obj) {
    return obj && obj.constructor === RegExp;
  };
  Ident.IsArray = function (obj) {
    return obj && obj.constructor == Array;
  };
  Ident.IsASPxClientCollection = function (obj) {
    return obj && obj.isASPxClientCollection;
  };
  Ident.IsASPxClientControl = function (obj) {
    return obj && obj.isASPxClientControl;
  };
  Ident.IsASPxClientEdit = function (obj) {
    return obj && obj.isASPxClientEdit;
  };
  Ident.IsFocusableElementRegardlessTabIndex = function (element) {
    var tagName = element.tagName;
    return (
      tagName == "TEXTAREA" ||
      tagName == "INPUT" ||
      tagName == "A" ||
      tagName == "SELECT" ||
      tagName == "IFRAME" ||
      tagName == "OBJECT"
    );
  };
  Ident.isDialogInvisibleControl = function (control) {
    return !!ASPx.Dialog && ASPx.Dialog.isDialogInvisibleControl(control);
  };
  PagerCommands = {
    Next: "PBN",
    Prev: "PBP",
    Last: "PBL",
    First: "PBF",
    PageNumber: "PN",
    PageSize: "PSP",
  };
  if (ASPx.IsFunction(window.WebForm_InitCallbackAddField)) {
    (function () {
      var original = window.WebForm_InitCallbackAddField;
      window.WebForm_InitCallbackAddField = function (name, value) {
        if (typeof name == "string" && name) original.apply(null, arguments);
      };
    })();
  }
  ASPx.FireDefaultButton = function (evt, buttonID) {
    if (_aspxIsDefaultButtonEvent(evt, buttonID)) {
      var defaultButton = ASPx.GetElementById(buttonID);
      if (defaultButton && defaultButton.click) {
        if (ASPx.IsFocusable(defaultButton)) defaultButton.focus();
        ASPx.Evt.DoElementClick(defaultButton);
        ASPx.Evt.PreventEventAndBubble(evt);
        return false;
      }
    }
    return true;
  };
  function _aspxIsDefaultButtonEvent(evt, defaultButtonID) {
    if (evt.keyCode != ASPx.Key.Enter) return false;
    var srcElement = ASPx.Evt.GetEventSource(evt);
    if (!srcElement || srcElement.id === defaultButtonID) return true;
    var tagName = srcElement.tagName;
    var type = srcElement.type;
    return (
      tagName != "TEXTAREA" &&
      tagName != "BUTTON" &&
      tagName != "A" &&
      (tagName != "INPUT" ||
        (type != "checkbox" &&
          type != "radio" &&
          type != "button" &&
          type != "submit" &&
          type != "reset"))
    );
  }
  var PostHandler = ASPx.CreateClass(null, {
    constructor: function () {
      this.Post = new ASPxClientEvent();
      this.PostFinalization = new ASPxClientEvent();
      this.observableForms = [];
      this.dxCallbackTriggers = {};
      this.lastSubmitElementName = null;
      this.ReplaceGlobalPostFunctions();
      this.HandleDxCallbackBeginning();
      this.HandleMSAjaxRequestBeginning();
    },
    Update: function () {
      this.ReplaceFormsSubmit(true);
    },
    ProcessPostRequest: function (
      ownerID,
      isCallback,
      isMSAjaxRequest,
      isDXCallback
    ) {
      this.cancelPostProcessing = false;
      this.isMSAjaxRequest = isMSAjaxRequest;
      if (this.SkipRaiseOnPost(ownerID, isCallback, isDXCallback)) return;
      var args = new PostHandlerOnPostEventArgs(
        ownerID,
        isCallback,
        isMSAjaxRequest,
        isDXCallback
      );
      this.Post.FireEvent(this, args);
      this.cancelPostProcessing = args.cancel;
      if (!args.cancel) this.PostFinalization.FireEvent(this, args);
    },
    SkipRaiseOnPost: function (ownerID, isCallback, isDXCallback) {
      if (!isCallback) return false;
      var dxOwner =
        isDXCallback && aspxGetControlCollection().GetByName(ownerID);
      if (dxOwner) {
        this.dxCallbackTriggers[dxOwner.uniqueID] = true;
        return false;
      }
      if (this.dxCallbackTriggers[ownerID]) {
        this.dxCallbackTriggers[ownerID] = false;
        return true;
      }
      return false;
    },
    ReplaceGlobalPostFunctions: function () {
      if (ASPx.IsFunction(window.__doPostBack)) this.ReplaceDoPostBack();
      if (ASPx.IsFunction(window.WebForm_DoCallback)) this.ReplaceDoCallback();
      this.ReplaceFormsSubmit();
    },
    HandleDxCallbackBeginning: function () {
      aspxGetControlCollection().BeforeInitCallback.AddHandler(function (s, e) {
        aspxRaisePostHandlerOnPost(e.callbackOwnerID, true, false, true);
      });
    },
    HandleMSAjaxRequestBeginning: function () {
      if (
        window.Sys &&
        Sys.WebForms &&
        Sys.WebForms.PageRequestManager &&
        Sys.WebForms.PageRequestManager.getInstance
      ) {
        var pageRequestManager = Sys.WebForms.PageRequestManager.getInstance();
        if (
          pageRequestManager != null &&
          Ident.IsArray(pageRequestManager._onSubmitStatements)
        ) {
          pageRequestManager._onSubmitStatements.unshift(function () {
            var postbackSettings =
              Sys.WebForms.PageRequestManager.getInstance()._postBackSettings;
            var postHandler = aspxGetPostHandler();
            aspxRaisePostHandlerOnPost(
              postbackSettings.asyncTarget,
              true,
              true
            );
            return !postHandler.cancelPostProcessing;
          });
        }
      }
    },
    ReplaceDoPostBack: function () {
      var original = __doPostBack;
      __doPostBack = function (eventTarget, eventArgument) {
        var postHandler = aspxGetPostHandler();
        aspxRaisePostHandlerOnPost(eventTarget);
        if (postHandler.cancelPostProcessing) return;
        ASPxClientControl.postHandlingLocked = true;
        original(eventTarget, eventArgument);
        delete ASPxClientControl.postHandlingLocked;
      };
    },
    ReplaceDoCallback: function () {
      var original = WebForm_DoCallback;
      WebForm_DoCallback = function (
        eventTarget,
        eventArgument,
        eventCallback,
        context,
        errorCallback,
        useAsync
      ) {
        var postHandler = aspxGetPostHandler();
        aspxRaisePostHandlerOnPost(eventTarget, true);
        if (postHandler.cancelPostProcessing) return;
        return original(
          eventTarget,
          eventArgument,
          eventCallback,
          context,
          errorCallback,
          useAsync
        );
      };
    },
    ReplaceFormsSubmit: function (checkObservableCollection) {
      for (var i = 0; i < document.forms.length; i++) {
        var form = document.forms[i];
        if (
          checkObservableCollection &&
          ASPx.Data.ArrayIndexOf(this.observableForms, form) >= 0
        )
          continue;
        if (form.submit) this.ReplaceFormSubmit(form);
        this.ReplaceFormOnSumbit(form);
        this.observableForms.push(form);
      }
    },
    ReplaceFormSubmit: function (form) {
      var originalSubmit = form.submit;
      form.submit = function () {
        var postHandler = aspxGetPostHandler();
        aspxRaisePostHandlerOnPost();
        if (postHandler.cancelPostProcessing) return false;
        var callee = arguments.callee;
        this.submit = originalSubmit;
        var submitResult = this.submit();
        this.submit = callee;
        return submitResult;
      };
      form = null;
    },
    ReplaceFormOnSumbit: function (form) {
      var originalSubmit = form.onsubmit;
      form.onsubmit = function () {
        var postHandler = aspxGetPostHandler();
        if (postHandler.isMSAjaxRequest) postHandler.isMsAjaxRequest = false;
        else aspxRaisePostHandlerOnPost(postHandler.GetLastSubmitElementName());
        if (postHandler.cancelPostProcessing) return false;
        return ASPx.IsFunction(originalSubmit)
          ? originalSubmit.apply(this, arguments)
          : true;
      };
      form = null;
    },
    SetLastSubmitElementName: function (elementName) {
      this.lastSubmitElementName = elementName;
    },
    GetLastSubmitElementName: function () {
      return this.lastSubmitElementName;
    },
    RemoveDisposedFormsFromCache: function () {
      for (
        var i = 0;
        this.observableForms && i < this.observableForms.length;
        i++
      ) {
        var form = this.observableForms[i];
        if (!ASPx.IsExistsElement(form)) {
          ASPx.Data.ArrayRemove(this.observableForms, form);
          i--;
        }
      }
    },
  });
  function aspxRaisePostHandlerOnPost(
    ownerID,
    isCallback,
    isMSAjaxRequest,
    isDXCallback
  ) {
    if (ASPxClientControl.postHandlingLocked) return;
    var postHandler = aspxGetPostHandler();
    if (postHandler)
      postHandler.ProcessPostRequest(
        ownerID,
        isCallback,
        isMSAjaxRequest,
        isDXCallback
      );
  }
  var aspxPostHandler;
  function aspxGetPostHandler() {
    if (!aspxPostHandler) aspxPostHandler = new PostHandler();
    return aspxPostHandler;
  }
  var BeforeInitCallbackEventArgs = ASPx.CreateClass(ASPxClientEventArgs, {
    constructor: function (callbackOwnerID) {
      this.constructor.prototype.constructor.call(this);
      this.callbackOwnerID = callbackOwnerID;
    },
  });
  var PostHandlerOnPostEventArgs = ASPx.CreateClass(ASPxClientCancelEventArgs, {
    constructor: function (
      ownerID,
      isCallback,
      isMSAjaxCallback,
      isDXCallback
    ) {
      this.constructor.prototype.constructor.call(this);
      this.ownerID = ownerID;
      this.isCallback = !!isCallback;
      this.isDXCallback = !!isDXCallback;
      this.isMSAjaxCallback = !!isMSAjaxCallback;
    },
  });
  var ResourceManager = {
    HandlerStr: "DXR.axd?r=",
    ResourceHashes: {},
    SynchronizeResources: function (method) {
      if (!method) {
        method = function (name, resource) {
          this.UpdateInputElements(name, resource);
        }.aspxBind(this);
      }
      var resources = this.GetResourcesData();
      for (var name in resources) method(name, resources[name]);
    },
    GetResourcesData: function () {
      return {
        DXScript: this.GetResourcesElementsString(
          _aspxGetIncludeScripts(),
          "src",
          "DXScript"
        ),
        DXCss: this.GetResourcesElementsString(
          _aspxGetLinks(),
          "href",
          "DXCss"
        ),
      };
    },
    GetResourcesElementsString: function (elements, urlAttr, id) {
      if (!this.ResourceHashes[id]) this.ResourceHashes[id] = {};
      var hash = this.ResourceHashes[id];
      for (var i = 0; i < elements.length; i++) {
        var resourceUrl = ASPx.Attr.GetAttribute(elements[i], urlAttr);
        if (resourceUrl) {
          var pos = resourceUrl.indexOf(this.HandlerStr);
          if (pos > -1) {
            var list = resourceUrl.substr(pos + this.HandlerStr.length);
            var ampPos = list.lastIndexOf("-");
            if (ampPos > -1) list = list.substr(0, ampPos);
            var indexes = list.split(",");
            for (var j = 0; j < indexes.length; j++)
              hash[indexes[j]] = indexes[j];
          } else hash[resourceUrl] = resourceUrl;
        }
      }
      var array = [];
      for (var key in hash) array.push(key);
      return array.join(",");
    },
    UpdateInputElements: function (typeName, list) {
      for (var i = 0; i < document.forms.length; i++) {
        var inputElement = document.forms[i][typeName];
        if (!inputElement)
          inputElement = this.CreateInputElement(document.forms[i], typeName);
        inputElement.value = list;
      }
    },
    CreateInputElement: function (form, typeName) {
      var inputElement = ASPx.CreateHiddenField(typeName, typeName);
      form.appendChild(inputElement);
      return inputElement;
    },
  };
  ASPx.includeScriptPrefix = "dxis_";
  ASPx.startupScriptPrefix = "dxss_";
  var includeScriptsCache = {};
  var createdIncludeScripts = [];
  var appendedScriptsCount = 0;
  var callbackOwnerNames = [];
  var scriptsRestartHandlers = {};
  function _aspxIsKnownIncludeScript(script) {
    return !!includeScriptsCache[script.src];
  }
  function _aspxCacheIncludeScript(script) {
    includeScriptsCache[script.src] = 1;
  }
  function _aspxProcessScriptsAndLinks(ownerName, isCallback) {
    if (!ASPx.documentLoaded) return;
    _aspxProcessScripts(ownerName, isCallback);
    getLinkProcessor().process();
    ASPx.ClearCachedCssRules();
  }
  function _aspxGetStartupScripts() {
    return _aspxGetScriptsCore(ASPx.startupScriptPrefix);
  }
  function _aspxGetIncludeScripts() {
    return _aspxGetScriptsCore(ASPx.includeScriptPrefix);
  }
  function _aspxGetScriptsCore(prefix) {
    var result = [];
    var scripts = document.getElementsByTagName("SCRIPT");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].id.indexOf(prefix) == 0) result.push(scripts[i]);
    }
    return result;
  }
  function _aspxGetLinks() {
    var result = [];
    var links = document.getElementsByTagName("LINK");
    for (var i = 0; i < links.length; i++) result[i] = links[i];
    return result;
  }
  function _aspxIsLinksLoaded() {
    var links = _aspxGetLinks();
    for (var i = 0, link; (link = links[i]); i++) {
      if (link.readyState && link.readyState.toLowerCase() == "loading")
        return false;
    }
    return true;
  }
  function _aspxInitializeLinks() {
    var links = _aspxGetLinks();
    for (var i = 0; i < links.length; i++) links[i].loaded = true;
  }
  function _aspxInitializeScripts() {
    var scripts = _aspxGetIncludeScripts();
    for (var i = 0; i < scripts.length; i++)
      _aspxCacheIncludeScript(scripts[i]);
    var startupScripts = _aspxGetStartupScripts();
    for (var i = 0; i < startupScripts.length; i++)
      startupScripts[i].executed = true;
  }
  function _aspxSweepDuplicatedLinks() {
    var hash = {};
    var links = _aspxGetLinks();
    for (var i = 0; i < links.length; i++) {
      var href = links[i].href;
      if (!href) continue;
      if (hash[href]) {
        if ((ASPx.Browser.IE || !hash[href].loaded) && links[i].loaded) {
          ASPx.RemoveElement(hash[href]);
          hash[href] = links[i];
        } else ASPx.RemoveElement(links[i]);
      } else hash[href] = links[i];
    }
  }
  function _aspxSweepDuplicatedScripts() {
    var hash = {};
    var scripts = _aspxGetIncludeScripts();
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src;
      if (!src) continue;
      if (hash[src]) ASPx.RemoveElement(scripts[i]);
      else hash[src] = scripts[i];
    }
  }
  function _aspxProcessScripts(ownerName, isCallback) {
    var scripts = _aspxGetIncludeScripts();
    var previousCreatedScript = null;
    var firstCreatedScript = null;
    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i];
      if (script.src == "") continue;
      if (_aspxIsKnownIncludeScript(script)) continue;
      var createdScript = document.createElement("script");
      createdScript.type = "text/javascript";
      createdScript.src = script.src;
      createdScript.id = script.id;
      function AreScriptsEqual(script1, script2) {
        return script1.src == script2.src;
      }
      if (
        ASPx.Data.ArrayIndexOf(
          createdIncludeScripts,
          createdScript,
          AreScriptsEqual
        ) >= 0
      )
        continue;
      createdIncludeScripts.push(createdScript);
      ASPx.RemoveElement(script);
      if (ASPx.Browser.IE && ASPx.Browser.Version < 9) {
        createdScript.onreadystatechange = new Function(
          "ASPx.OnScriptReadyStateChangedCallback(this, " + isCallback + ");"
        );
      } else if (
        ASPx.Browser.Edge ||
        ASPx.Browser.WebKitFamily ||
        (ASPx.Browser.Firefox && ASPx.Browser.Version >= 4) ||
        (ASPx.Browser.IE && ASPx.Browser.Version >= 9)
      ) {
        createdScript.onload = new Function(
          "ASPx.OnScriptLoadCallback(this, " + isCallback + ");"
        );
        if (firstCreatedScript == null) firstCreatedScript = createdScript;
        createdScript.nextCreatedScript = null;
        if (previousCreatedScript != null)
          previousCreatedScript.nextCreatedScript = createdScript;
        previousCreatedScript = createdScript;
      } else {
        createdScript.onload = new Function("ASPx.OnScriptLoadCallback(this);");
        ASPx.AppendScript(createdScript);
        _aspxCacheIncludeScript(createdScript);
      }
    }
    if (firstCreatedScript != null) {
      ASPx.AppendScript(firstCreatedScript);
      _aspxCacheIncludeScript(firstCreatedScript);
    }
    if (isCallback) callbackOwnerNames.push(ownerName);
    if (createdIncludeScripts.length == 0) {
      var newLinks = ASPx.GetNodesByTagName(document.body, "link");
      var needProcessLinks = isCallback && newLinks.length > 0;
      if (needProcessLinks)
        needProcessLinks = getLinkProcessor().addLinks(newLinks);
      if (!needProcessLinks) ASPx.FinalizeScriptProcessing(isCallback);
    }
  }
  ASPx.FinalizeScriptProcessing = function (isCallback) {
    createdIncludeScripts = [];
    appendedScriptsCount = 0;
    var linkProcessor = getLinkProcessor();
    if (linkProcessor.hasLinks()) _aspxSweepDuplicatedLinks();
    linkProcessor.reset();
    _aspxSweepDuplicatedScripts();
    _aspxRunStartupScripts(isCallback);
    ResourceManager.SynchronizeResources();
  };
  var startupScriptsRunning = false;
  function _aspxRunStartupScripts(isCallback) {
    startupScriptsRunning = true;
    try {
      _aspxRunStartupScriptsCore();
    } finally {
      startupScriptsRunning = false;
    }
    if (ASPx.documentLoaded) {
      aspxGetControlCollection().InitializeElements(isCallback);
      for (var key in scriptsRestartHandlers) scriptsRestartHandlers[key]();
      _aspxRunEndCallbackScript();
    }
  }
  function _aspxRunStartupScriptsCore() {
    var scripts = _aspxGetStartupScripts();
    var code;
    for (var i = 0; i < scripts.length; i++) {
      if (!scripts[i].executed) {
        code = ASPx.GetScriptCode(scripts[i]);
        eval(code);
        scripts[i].executed = true;
      }
    }
  }
  function _aspxRunEndCallbackScript() {
    while (callbackOwnerNames.length > 0) {
      var callbackOwnerName = callbackOwnerNames.pop();
      var callbackOwner = aspxGetControlCollection().Get(callbackOwnerName);
      if (callbackOwner) callbackOwner.DoEndCallback();
    }
  }
  ASPx.OnScriptReadyStateChangedCallback = function (
    scriptElement,
    isCallback
  ) {
    if (scriptElement.readyState == "loaded") {
      _aspxCacheIncludeScript(scriptElement);
      for (var i = 0; i < createdIncludeScripts.length; i++) {
        var script = createdIncludeScripts[i];
        if (_aspxIsKnownIncludeScript(script)) {
          if (!script.executed) {
            script.executed = true;
            ASPx.AppendScript(script);
            appendedScriptsCount++;
          }
        } else break;
      }
      if (createdIncludeScripts.length == appendedScriptsCount)
        ASPx.FinalizeScriptProcessing(isCallback);
    }
  };
  ASPx.OnScriptLoadCallback = function (scriptElement, isCallback) {
    appendedScriptsCount++;
    if (scriptElement.nextCreatedScript) {
      ASPx.AppendScript(scriptElement.nextCreatedScript);
      _aspxCacheIncludeScript(scriptElement.nextCreatedScript);
    }
    if (createdIncludeScripts.length == appendedScriptsCount)
      ASPx.FinalizeScriptProcessing(isCallback);
  };
  function _aspxAddScriptsRestartHandler(objectName, handler) {
    scriptsRestartHandlers[objectName] = handler;
  }
  function _aspxMoveLinkElements() {
    var head = ASPx.GetNodesByTagName(document, "head")[0];
    var bodyLinks = ASPx.GetNodesByTagName(document.body, "link");
    if (head && bodyLinks.length > 0) {
      var headLinks = ASPx.GetNodesByTagName(head, "link");
      var dxLinkAnchor = head.firstChild;
      for (var i = 0; i < headLinks.length; i++) {
        if (headLinks[i].href.indexOf(ResourceManager.HandlerStr) > -1)
          dxLinkAnchor = headLinks[i].nextSibling;
      }
      while (bodyLinks.length > 0)
        head.insertBefore(bodyLinks[0], dxLinkAnchor);
    }
  }
  var LinkProcessor = ASPx.CreateClass(null, {
    constructor: function () {
      this.loadedLinkCount = 0;
      this.linkInfos = [];
      this.loadingObservationTimerID = -1;
    },
    process: function () {
      if (this.hasLinks()) {
        if (this.isLinkLoadEventSupported()) this.processViaLoadEvent();
        else this.processViaTimer();
      } else _aspxSweepDuplicatedLinks();
      _aspxMoveLinkElements();
    },
    addLinks: function (links) {
      var prevLinkCount = this.linkInfos.length;
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (
          link.loaded ||
          link.rel != "stylesheet" ||
          link.type != "text/css" ||
          link.href.toLowerCase().indexOf("dxr.axd?r=") == -1
        )
          continue;
        var linkInfo = {
          link: link,
          href: link.href,
        };
        this.linkInfos.push(linkInfo);
      }
      return prevLinkCount != this.linkInfos.length;
    },
    hasLinks: function () {
      return this.linkInfos.length > 0;
    },
    reset: function () {
      this.linkInfos = [];
      this.loadedLinkCount = 0;
    },
    processViaLoadEvent: function () {
      for (var i = 0, linkInfo; (linkInfo = this.linkInfos[i]); i++) {
        if (ASPx.Browser.IE && ASPx.Browser.Version < 9) {
          var that = this;
          linkInfo.link.onreadystatechange = function () {
            that.onLinkReadyStateChanged(this);
          };
        } else linkInfo.link.onload = this.onLinkLoad.aspxBind(this);
      }
    },
    isLinkLoadEventSupported: function () {
      return !(
        (ASPx.Browser.Chrome && ASPx.Browser.MajorVersion < 19) ||
        (ASPx.Browser.Firefox && ASPx.Browser.MajorVersion < 9) ||
        (ASPx.Browser.Safari && ASPx.Browser.MajorVersion < 6) ||
        (ASPx.Browser.AndroidDefaultBrowser && ASPx.Browser.MajorVersion < 4.4)
      );
    },
    processViaTimer: function () {
      if (this.loadingObservationTimerID == -1) this.onLinksLoadingObserve();
    },
    onLinksLoadingObserve: function () {
      if (this.getIsAllLinksLoaded()) {
        this.loadingObservationTimerID = -1;
        this.onAllLinksLoad();
      } else
        this.loadingObservationTimerID = window.setTimeout(
          this.onLinksLoadingObserve.aspxBind(this),
          100
        );
    },
    getIsAllLinksLoaded: function () {
      var styleSheets = document.styleSheets;
      var loadedLinkHrefs = {};
      for (var i = 0; i < styleSheets.length; i++) {
        var styleSheet = styleSheets[i];
        try {
          if (styleSheet.cssRules) loadedLinkHrefs[styleSheet.href] = 1;
        } catch (ex) {}
      }
      var loadedLinksCount = 0;
      for (var i = 0, linkInfo; (linkInfo = this.linkInfos[i]); i++) {
        if (loadedLinkHrefs[linkInfo.href]) loadedLinksCount++;
      }
      return loadedLinksCount == this.linkInfos.length;
    },
    onAllLinksLoad: function () {
      this.reset();
      _aspxSweepDuplicatedLinks();
      if (createdIncludeScripts.length == 0)
        ASPx.FinalizeScriptProcessing(true);
    },
    onLinkReadyStateChanged: function (linkElement) {
      if (linkElement.readyState == "complete")
        this.onLinkLoadCore(linkElement);
    },
    onLinkLoad: function (evt) {
      var linkElement = ASPx.Evt.GetEventSource(evt);
      this.onLinkLoadCore(linkElement);
    },
    onLinkLoadCore: function (linkElement) {
      if (!this.hasLinkElement(linkElement)) return;
      this.loadedLinkCount++;
      if (
        (!ASPx.Browser.Firefox &&
          this.loadedLinkCount == this.linkInfos.length) ||
        (ASPx.Browser.Firefox &&
          this.loadedLinkCount == 2 * this.linkInfos.length)
      ) {
        this.onAllLinksLoad();
      }
    },
    hasLinkElement: function (linkElement) {
      for (var i = 0, linkInfo; (linkInfo = this.linkInfos[i]); i++) {
        if (linkInfo.link == linkElement) return true;
      }
      return false;
    },
  });
  var linkProcessor = null;
  function getLinkProcessor() {
    if (linkProcessor == null) linkProcessor = new LinkProcessor();
    return linkProcessor;
  }
  var IFrameHelper = ASPx.CreateClass(null, {
    constructor: function (params) {
      this.params = params || {};
      this.params.src = this.params.src || "";
      this.CreateElements();
    },
    CreateElements: function () {
      var elements = IFrameHelper.Create(this.params);
      this.containerElement = elements.container;
      this.iframeElement = elements.iframe;
      this.AttachOnLoadHandler(this, this.iframeElement);
      this.SetLoading(true);
      if (this.params.onCreate)
        this.params.onCreate(this.containerElement, this.iframeElement);
    },
    AttachOnLoadHandler: function (instance, element) {
      ASPx.Evt.AttachEventToElement(element, "load", function () {
        instance.OnLoad(element);
      });
    },
    OnLoad: function (element) {
      this.SetLoading(false, element);
      if (!element.preventCustomOnLoad && this.params.onLoad)
        this.params.onLoad();
    },
    IsLoading: function (element) {
      element = element || this.iframeElement;
      if (element) return element.loading;
      return false;
    },
    SetLoading: function (value, element) {
      element = element || this.iframeElement;
      if (element) element.loading = value;
    },
    GetContentUrl: function () {
      return this.params.src;
    },
    SetContentUrl: function (url, preventBrowserCaching) {
      if (url) {
        this.params.src = url;
        if (preventBrowserCaching) url = IFrameHelper.AddRandomParamToUrl(url);
        this.SetLoading(true);
        this.iframeElement.src = url;
      }
    },
    RefreshContentUrl: function () {
      if (this.IsLoading()) return;
      this.SetLoading(true);
      var oldContainerElement = this.containerElement;
      var oldIframeElement = this.iframeElement;
      var postfix = "_del" + Math.floor(Math.random() * 100000).toString();
      if (this.params.id) oldIframeElement.id = this.params.id + postfix;
      if (this.params.name) oldIframeElement.name = this.params.name + postfix;
      ASPx.SetStyles(oldContainerElement, { height: 0 });
      this.CreateElements();
      oldIframeElement.preventCustomOnLoad = true;
      oldIframeElement.src = ASPx.BlankUrl;
      window.setTimeout(function () {
        oldContainerElement.parentNode.removeChild(oldContainerElement);
      }, 10000);
    },
  });
  IFrameHelper.Create = function (params) {
    var iframeHtmlStringParts = ["<iframe frameborder='0'"];
    if (params) {
      if (params.id) iframeHtmlStringParts.push(" id='", params.id, "'");
      if (params.name) iframeHtmlStringParts.push(" name='", params.name, "'");
      if (params.title)
        iframeHtmlStringParts.push(" title='", params.title, "'");
      if (params.scrolling)
        iframeHtmlStringParts.push(" scrolling='", params.scrolling, "'");
      if (params.src) iframeHtmlStringParts.push(" src='", params.src, "'");
    }
    iframeHtmlStringParts.push("></iframe>");
    var containerElement = ASPx.CreateHtmlElementFromString(
      "<div style='border-width: 0px; padding: 0px; margin: 0px'></div>"
    );
    var iframeElement = ASPx.CreateHtmlElementFromString(
      iframeHtmlStringParts.join("")
    );
    containerElement.appendChild(iframeElement);
    return {
      container: containerElement,
      iframe: iframeElement,
    };
  };
  IFrameHelper.AddRandomParamToUrl = function (url) {
    var prefix = url.indexOf("?") > -1 ? "&" : "?";
    var param = prefix + Math.floor(Math.random() * 100000).toString();
    var anchorIndex = url.indexOf("#");
    return anchorIndex == -1
      ? url + param
      : url.substr(0, anchorIndex) + param + url.substr(anchorIndex);
  };
  IFrameHelper.GetWindow = function (name) {
    if (ASPx.Browser.IE) return window.frames[name].window;
    else {
      var frameElement = document.getElementById(name);
      return frameElement != null ? frameElement.contentWindow : null;
    }
  };
  IFrameHelper.GetDocument = function (name) {
    var frameElement;
    if (ASPx.Browser.IE) {
      frameElement = window.frames[name];
      return frameElement != null ? frameElement.document : null;
    } else {
      frameElement = document.getElementById(name);
      return frameElement != null ? frameElement.contentDocument : null;
    }
  };
  IFrameHelper.GetDocumentBody = function (name) {
    var doc = IFrameHelper.GetDocument(name);
    return doc != null ? doc.body : null;
  };
  IFrameHelper.GetDocumentHead = function (name) {
    var doc = IFrameHelper.GetDocument(name);
    return doc != null ? doc.head || doc.getElementsByTagName("head")[0] : null;
  };
  IFrameHelper.GetElement = function (name) {
    if (ASPx.Browser.IE) return window.frames[name].window.frameElement;
    else return document.getElementById(name);
  };
  var KbdHelper = ASPx.CreateClass(null, {
    constructor: function (control) {
      this.control = control;
    },
    Init: function () {
      KbdHelper.GlobalInit();
      var element = this.GetFocusableElement();
      element.tabIndex = Math.max(element.tabIndex, 0);
      var instance = this;
      ASPx.Evt.AttachEventToElement(element, "click", function (e) {
        instance.HandleClick(e);
      });
      ASPx.Evt.AttachEventToElement(element, "focus", function (e) {
        if (!instance.CanFocus(e)) return true;
        KbdHelper.active = instance;
      });
      ASPx.Evt.AttachEventToElement(element, "blur", function () {
        delete KbdHelper.active;
      });
    },
    GetFocusableElement: function () {
      return this.control.GetMainElement();
    },
    CanFocus: function (e) {
      var tag = ASPx.Evt.GetEventSource(e).tagName;
      if (
        tag == "A" ||
        tag == "TEXTAREA" ||
        tag == "INPUT" ||
        tag == "SELECT" ||
        tag == "IFRAME" ||
        tag == "OBJECT"
      )
        return false;
      return true;
    },
    HandleClick: function (e) {
      if (!this.CanFocus(e)) return;
      this.Focus();
    },
    Focus: function () {
      try {
        this.GetFocusableElement().focus();
      } catch (e) {}
    },
    HandleKeyDown: function (e) {},
    HandleKeyPress: function (e) {},
    HandleKeyUp: function (e) {},
  });
  KbdHelper.GlobalInit = function () {
    if (KbdHelper.ready) return;
    ASPx.Evt.AttachEventToDocument("keydown", KbdHelper.OnKeyDown);
    ASPx.Evt.AttachEventToDocument("keypress", KbdHelper.OnKeyPress);
    ASPx.Evt.AttachEventToDocument("keyup", KbdHelper.OnKeyUp);
    KbdHelper.ready = true;
  };
  KbdHelper.swallowKey = false;
  KbdHelper.accessKeys = {};
  KbdHelper.ProcessKey = function (e, actionName) {
    if (!KbdHelper.active) return;
    if (KbdHelper.active.GetFocusableElement() !== _aspxGetFocusedElement())
      return;
    var ctl = KbdHelper.active.control;
    if (ctl !== aspxGetControlCollection().Get(ctl.name)) {
      delete KbdHelper.active;
      return;
    }
    if (!KbdHelper.swallowKey)
      KbdHelper.swallowKey = KbdHelper.active[actionName](e);
    if (KbdHelper.swallowKey) ASPx.Evt.PreventEvent(e);
  };
  KbdHelper.OnKeyDown = function (e) {
    KbdHelper.swallowKey = false;
    if (
      e.ctrlKey &&
      e.shiftKey &&
      KbdHelper.TryAccessKey(ASPx.Evt.GetKeyCode(e))
    )
      ASPx.Evt.PreventEvent(e);
    else KbdHelper.ProcessKey(e, "HandleKeyDown");
  };
  KbdHelper.OnKeyPress = function (e) {
    KbdHelper.ProcessKey(e, "HandleKeyPress");
  };
  KbdHelper.OnKeyUp = function (e) {
    KbdHelper.ProcessKey(e, "HandleKeyUp");
  };
  KbdHelper.RegisterAccessKey = function (obj) {
    var key = obj.accessKey;
    if (!key) return;
    KbdHelper.accessKeys[key.toLowerCase()] = obj.name;
  };
  KbdHelper.TryAccessKey = function (code) {
    var name = KbdHelper.accessKeys[String.fromCharCode(code).toLowerCase()];
    if (!name) return false;
    var obj = aspxGetControlCollection().Get(name);
    if (!obj) return false;
    var el = obj.GetMainElement();
    if (!el) return false;
    el.focus();
    return true;
  };
  var focusedElement = null;
  function aspxOnElementFocused(evt) {
    evt = ASPx.Evt.GetEvent(evt);
    if (evt && evt.target) focusedElement = evt.target;
  }
  function _aspxInitializeFocus() {
    if (!ASPx.GetActiveElement())
      ASPx.Evt.AttachEventToDocument("focus", aspxOnElementFocused);
  }
  function _aspxGetFocusedElement() {
    var activeElement = ASPx.GetActiveElement();
    return activeElement ? activeElement : focusedElement;
  }
  CheckBoxCheckState = {
    Checked: "Checked",
    Unchecked: "Unchecked",
    Indeterminate: "Indeterminate",
  };
  CheckBoxInputKey = {
    Checked: "C",
    Unchecked: "U",
    Indeterminate: "I",
  };
  var CheckableElementStateController = ASPx.CreateClass(null, {
    constructor: function (imageProperties) {
      this.checkBoxStates = [];
      this.imageProperties = imageProperties;
    },
    GetValueByInputKey: function (inputKey) {
      return this.GetFirstValueBySecondValue(
        "Value",
        "StateInputKey",
        inputKey
      );
    },
    GetInputKeyByValue: function (value) {
      return this.GetFirstValueBySecondValue("StateInputKey", "Value", value);
    },
    GetImagePropertiesNumByInputKey: function (value) {
      return this.GetFirstValueBySecondValue(
        "ImagePropertiesNumber",
        "StateInputKey",
        value
      );
    },
    GetNextCheckBoxValue: function (currentValue, allowGrayed) {
      var currentInputKey = this.GetInputKeyByValue(currentValue);
      var nextInputKey = "";
      switch (currentInputKey) {
        case CheckBoxInputKey.Checked:
          nextInputKey = CheckBoxInputKey.Unchecked;
          break;
        case CheckBoxInputKey.Unchecked:
          nextInputKey = allowGrayed
            ? CheckBoxInputKey.Indeterminate
            : CheckBoxInputKey.Checked;
          break;
        case CheckBoxInputKey.Indeterminate:
          nextInputKey = CheckBoxInputKey.Checked;
          break;
      }
      return this.GetValueByInputKey(nextInputKey);
    },
    GetCheckStateByInputKey: function (inputKey) {
      switch (inputKey) {
        case CheckBoxInputKey.Checked:
          return CheckBoxCheckState.Checked;
        case CheckBoxInputKey.Unchecked:
          return CheckBoxCheckState.Unchecked;
        case CheckBoxInputKey.Indeterminate:
          return CheckBoxCheckState.Indeterminate;
      }
    },
    GetValueByCheckState: function (checkState) {
      switch (checkState) {
        case CheckBoxCheckState.Checked:
          return this.GetValueByInputKey(CheckBoxInputKey.Checked);
        case CheckBoxCheckState.Unchecked:
          return this.GetValueByInputKey(CheckBoxInputKey.Unchecked);
        case CheckBoxCheckState.Indeterminate:
          return this.GetValueByInputKey(CheckBoxInputKey.Indeterminate);
      }
    },
    GetFirstValueBySecondValue: function (
      firstValueName,
      secondValueName,
      secondValue
    ) {
      return this.GetValueByFunc(firstValueName, function (checkBoxState) {
        return checkBoxState[secondValueName] === secondValue;
      });
    },
    GetValueByFunc: function (valueName, func) {
      for (var i = 0; i < this.checkBoxStates.length; i++) {
        if (func(this.checkBoxStates[i]))
          return this.checkBoxStates[i][valueName];
      }
    },
    AssignElementClassName: function (
      element,
      cssClassPropertyKey,
      disabledCssClassPropertyKey,
      assignedClassName
    ) {
      var classNames = [];
      for (
        var i = 0;
        i < this.imageProperties[cssClassPropertyKey].length;
        i++
      ) {
        classNames.push(this.imageProperties[disabledCssClassPropertyKey][i]);
        classNames.push(this.imageProperties[cssClassPropertyKey][i]);
      }
      var elementClassName = element.className;
      for (var i = 0; i < classNames.length; i++) {
        var className = classNames[i];
        var index = elementClassName.indexOf(className);
        if (index > -1)
          elementClassName = elementClassName.replace(
            (index == 0 ? "" : " ") + className,
            ""
          );
      }
      elementClassName += " " + assignedClassName;
      element.className = elementClassName;
    },
    UpdateInternalCheckBoxDecoration: function (
      mainElement,
      inputKey,
      enabled
    ) {
      var imagePropertiesNumber =
        this.GetImagePropertiesNumByInputKey(inputKey);
      for (var imagePropertyKey in this.imageProperties) {
        var propertyValue =
          this.imageProperties[imagePropertyKey][imagePropertiesNumber];
        propertyValue =
          propertyValue || !isNaN(propertyValue) ? propertyValue : "";
        switch (imagePropertyKey) {
          case "0":
            mainElement.title = propertyValue;
            break;
          case "1":
            mainElement.style.width =
              propertyValue + (propertyValue != "" ? "px" : "");
            break;
          case "2":
            mainElement.style.height =
              propertyValue + (propertyValue != "" ? "px" : "");
            break;
        }
        if (enabled) {
          switch (imagePropertyKey) {
            case "3":
              this.SetImageSrc(mainElement, propertyValue);
              break;
            case "4":
              this.AssignElementClassName(mainElement, "4", "8", propertyValue);
              break;
            case "5":
              this.SetBackgroundPosition(mainElement, propertyValue, true);
              break;
            case "6":
              this.SetBackgroundPosition(mainElement, propertyValue, false);
              break;
          }
        } else {
          switch (imagePropertyKey) {
            case "7":
              this.SetImageSrc(mainElement, propertyValue);
              break;
            case "8":
              this.AssignElementClassName(mainElement, "4", "8", propertyValue);
              break;
            case "9":
              this.SetBackgroundPosition(mainElement, propertyValue, true);
              break;
            case "10":
              this.SetBackgroundPosition(mainElement, propertyValue, false);
              break;
          }
        }
      }
    },
    SetImageSrc: function (mainElement, src) {
      if (src === "") {
        mainElement.style.backgroundImage = "";
        mainElement.style.backgroundPosition = "";
      } else {
        mainElement.style.backgroundImage = "url('" + src + "')";
        this.SetBackgroundPosition(mainElement, 0, true);
        this.SetBackgroundPosition(mainElement, 0, false);
      }
    },
    SetBackgroundPosition: function (element, value, isX) {
      if (value === "") {
        element.style.backgroundPosition = value;
        return;
      }
      if (element.style.backgroundPosition === "")
        element.style.backgroundPosition = isX
          ? "-" + value.toString() + "px 0px"
          : "0px -" + value.toString() + "px";
      else {
        var position = element.style.backgroundPosition.split(" ");
        element.style.backgroundPosition = isX
          ? "-" + value.toString() + "px " + position[1]
          : position[0] + " -" + value.toString() + "px";
      }
    },
    AddState: function (value, stateInputKey, imagePropertiesNumber) {
      this.checkBoxStates.push({
        Value: value,
        StateInputKey: stateInputKey,
        ImagePropertiesNumber: imagePropertiesNumber,
      });
    },
    GetAriaCheckedValue: function (state) {
      switch (state) {
        case ASPx.CheckBoxCheckState.Checked:
          return "true";
        case ASPx.CheckBoxCheckState.Unchecked:
          return "false";
        case ASPx.CheckBoxCheckState.Indeterminate:
          return "mixed";
        default:
          return "";
      }
    },
  });
  CheckableElementStateController.Create = function (
    imageProperties,
    valueChecked,
    valueUnchecked,
    valueGrayed,
    allowGrayed
  ) {
    var stateController = new CheckableElementStateController(imageProperties);
    stateController.AddState(valueChecked, CheckBoxInputKey.Checked, 0);
    stateController.AddState(valueUnchecked, CheckBoxInputKey.Unchecked, 1);
    if (typeof valueGrayed != "undefined")
      stateController.AddState(
        valueGrayed,
        CheckBoxInputKey.Indeterminate,
        allowGrayed ? 2 : 1
      );
    stateController.allowGrayed = allowGrayed;
    return stateController;
  };
  var CheckableElementHelper = ASPx.CreateClass(null, {
    InternalCheckBoxInitialize: function (internalCheckBox) {
      this.AttachToMainElement(internalCheckBox);
      this.AttachToInputElement(internalCheckBox);
    },
    AttachToMainElement: function (internalCheckBox) {
      var instance = this;
      if (internalCheckBox.mainElement) {
        ASPx.Evt.AttachEventToElement(
          internalCheckBox.mainElement,
          "click",
          function (evt) {
            instance.InvokeClick(internalCheckBox, evt);
            if (!internalCheckBox.disableCancelBubble)
              return ASPx.Evt.PreventEventAndBubble(evt);
          }
        );
        ASPx.Evt.AttachEventToElement(
          internalCheckBox.mainElement,
          "mousedown",
          function (evt) {
            internalCheckBox.Refocus();
          }
        );
        ASPx.Evt.PreventElementDragAndSelect(
          internalCheckBox.mainElement,
          true
        );
      }
    },
    AttachToInputElement: function (internalCheckBox) {
      var instance = this;
      if (internalCheckBox.inputElement && internalCheckBox.mainElement) {
        var checkableElement = internalCheckBox.accessibilityCompliant
          ? internalCheckBox.mainElement
          : internalCheckBox.inputElement;
        ASPx.Evt.AttachEventToElement(
          checkableElement,
          "focus",
          function (evt) {
            if (!internalCheckBox.enabled) checkableElement.blur();
            else internalCheckBox.OnFocus();
          }
        );
        ASPx.Evt.AttachEventToElement(checkableElement, "blur", function (evt) {
          internalCheckBox.OnLostFocus();
        });
        ASPx.Evt.AttachEventToElement(
          checkableElement,
          "keyup",
          function (evt) {
            if (ASPx.Evt.GetKeyCode(evt) == ASPx.Key.Space)
              instance.InvokeClick(internalCheckBox, evt);
          }
        );
        ASPx.Evt.AttachEventToElement(
          checkableElement,
          "keydown",
          function (evt) {
            if (ASPx.Evt.GetKeyCode(evt) == ASPx.Key.Space)
              return ASPx.Evt.PreventEvent(evt);
          }
        );
      }
    },
    IsKBSInputWrapperExist: function () {
      return ASPx.Browser.Opera || ASPx.Browser.WebKitFamily;
    },
    GetICBMainElementByInput: function (icbInputElement) {
      return this.IsKBSInputWrapperExist()
        ? icbInputElement.parentNode.parentNode
        : icbInputElement.parentNode;
    },
    InvokeClick: function (internalCheckBox, evt) {
      if (internalCheckBox.enabled && !internalCheckBox.readOnly) {
        var inputElementValue = internalCheckBox.inputElement.value;
        var focusableElement = internalCheckBox.accessibilityCompliant
          ? internalCheckBox.mainElement
          : internalCheckBox.inputElement;
        focusableElement.focus();
        if (!ASPx.Browser.IE)
          internalCheckBox.inputElement.value = inputElementValue;
        this.InvokeClickCore(internalCheckBox, evt);
      }
    },
    InvokeClickCore: function (internalCheckBox, evt) {
      internalCheckBox.OnClick(evt);
    },
  });
  CheckableElementHelper.Instance = new CheckableElementHelper();
  var CheckBoxInternal = ASPx.CreateClass(null, {
    constructor: function (
      inputElement,
      stateController,
      allowGrayed,
      allowGrayedByClick,
      helper,
      container,
      storeValueInInput,
      key,
      disableCancelBubble,
      accessibilityCompliant
    ) {
      this.inputElement = inputElement;
      this.mainElement = helper.GetICBMainElementByInput(this.inputElement);
      this.name =
        (key ? key : this.inputElement.id) +
        CheckBoxInternal.GetICBMainElementPostfix();
      this.mainElement.id = this.name;
      this.stateController = stateController;
      this.container = container;
      this.allowGrayed = allowGrayed;
      this.allowGrayedByClick = allowGrayedByClick;
      this.autoSwitchEnabled = true;
      this.storeValueInInput = !!storeValueInInput;
      this.storedInputKey = !this.storeValueInInput
        ? this.inputElement.value
        : null;
      this.disableCancelBubble = !!disableCancelBubble;
      this.accessibilityCompliant = accessibilityCompliant;
      this.focusDecoration = null;
      this.focused = false;
      this.focusLocked = false;
      this.enabled = true;
      this.readOnly = false;
      this.CheckedChanged = new ASPxClientEvent();
      this.Focus = new ASPxClientEvent();
      this.LostFocus = new ASPxClientEvent();
      helper.InternalCheckBoxInitialize(this);
    },
    ChangeInputElementTabIndex: function () {
      var changeMethod = this.enabled
        ? ASPx.Attr.RestoreTabIndexAttribute
        : ASPx.Attr.SaveTabIndexAttributeAndReset;
      changeMethod(this.inputElement);
    },
    CreateFocusDecoration: function (focusedStyle) {
      this.focusDecoration = new EditorStyleDecoration(this);
      this.focusDecoration.AddStyle("F", focusedStyle[0], focusedStyle[1]);
      this.focusDecoration.AddPostfix("");
    },
    UpdateFocusDecoration: function () {
      this.focusDecoration.Update();
    },
    StoreInputKey: function (inputKey) {
      if (this.storeValueInInput) this.inputElement.value = inputKey;
      else this.storedInputKey = inputKey;
    },
    GetStoredInputKey: function () {
      if (this.storeValueInInput) return this.inputElement.value;
      else return this.storedInputKey;
    },
    OnClick: function (e) {
      if (this.autoSwitchEnabled) {
        var currentValue = this.GetValue();
        var value = this.stateController.GetNextCheckBoxValue(
          currentValue,
          this.allowGrayedByClick && this.allowGrayed
        );
        this.SetValue(value);
      }
      this.CheckedChanged.FireEvent(this, e);
    },
    OnFocus: function () {
      if (!this.IsFocusLocked()) {
        this.focused = true;
        this.UpdateFocusDecoration();
        this.Focus.FireEvent(this, null);
      } else this.UnlockFocus();
    },
    OnLostFocus: function () {
      if (!this.IsFocusLocked()) {
        this.focused = false;
        this.UpdateFocusDecoration();
        this.LostFocus.FireEvent(this, null);
      }
    },
    Refocus: function () {
      if (this.focused) {
        this.LockFocus();
        this.inputElement.blur();
        if (ASPx.Browser.MacOSMobilePlatform) {
          window.setTimeout(function () {
            ASPx.SetFocus(this.inputElement);
          }, 100);
        } else {
          ASPx.SetFocus(this.inputElement);
        }
      }
    },
    LockFocus: function () {
      this.focusLocked = true;
    },
    UnlockFocus: function () {
      this.focusLocked = false;
    },
    IsFocusLocked: function () {
      if (
        !!ASPx.Attr.GetAttribute(
          this.mainElement,
          ASPx.Attr.GetTabIndexAttributeName()
        )
      )
        return false;
      return this.focusLocked;
    },
    SetValue: function (value) {
      var currentValue = this.GetValue();
      if (currentValue !== value) {
        var newInputKey = this.stateController.GetInputKeyByValue(value);
        if (newInputKey) {
          this.StoreInputKey(newInputKey);
          this.stateController.UpdateInternalCheckBoxDecoration(
            this.mainElement,
            newInputKey,
            this.enabled
          );
        }
      }
      if (this.accessibilityCompliant) {
        var state = this.GetCurrentCheckState();
        var value = this.stateController.GetAriaCheckedValue(state);
        if (this.mainElement.attributes["aria-checked"] !== undefined)
          this.mainElement.setAttribute("aria-checked", value);
        if (this.mainElement.attributes["aria-selected"] !== undefined)
          this.mainElement.setAttribute("aria-selected", value);
      }
    },
    GetValue: function () {
      return this.stateController.GetValueByInputKey(this.GetCurrentInputKey());
    },
    GetCurrentCheckState: function () {
      return this.stateController.GetCheckStateByInputKey(
        this.GetCurrentInputKey()
      );
    },
    GetCurrentInputKey: function () {
      return this.GetStoredInputKey();
    },
    GetChecked: function () {
      return this.GetCurrentInputKey() === CheckBoxInputKey.Checked;
    },
    SetChecked: function (checked) {
      var newValue = this.stateController.GetValueByCheckState(
        checked ? CheckBoxCheckState.Checked : CheckBoxCheckState.Unchecked
      );
      this.SetValue(newValue);
    },
    SetEnabled: function (enabled) {
      if (this.enabled != enabled) {
        this.enabled = enabled;
        this.stateController.UpdateInternalCheckBoxDecoration(
          this.mainElement,
          this.GetCurrentInputKey(),
          this.enabled
        );
        this.ChangeInputElementTabIndex();
      }
    },
  });
  CheckBoxInternal.GetICBMainElementPostfix = function () {
    return "_D";
  };
  var CheckBoxInternalCollection = ASPx.CreateClass(CollectionBase, {
    constructor: function (
      imageProperties,
      allowGrayed,
      storeValueInInput,
      helper,
      disableCancelBubble,
      accessibilityCompliant
    ) {
      this.constructor.prototype.constructor.call(this);
      this.stateController = allowGrayed
        ? CheckableElementStateController.Create(
            imageProperties,
            CheckBoxInputKey.Checked,
            CheckBoxInputKey.Unchecked,
            CheckBoxInputKey.Indeterminate,
            true
          )
        : CheckableElementStateController.Create(
            imageProperties,
            CheckBoxInputKey.Checked,
            CheckBoxInputKey.Unchecked
          );
      this.helper = helper || CheckableElementHelper.Instance;
      this.storeValueInInput = !!storeValueInInput;
      this.disableCancelBubble = !!disableCancelBubble;
      this.accessibilityCompliant = accessibilityCompliant;
    },
    Add: function (key, inputElement, container) {
      this.Remove(key);
      var checkBox = this.CreateInternalCheckBox(key, inputElement, container);
      this.constructor.prototype.Add.call(this, key, checkBox);
      return checkBox;
    },
    SetImageProperties: function (imageProperties) {
      this.stateController.imageProperties = imageProperties;
    },
    CreateInternalCheckBox: function (key, inputElement, container) {
      return new CheckBoxInternal(
        inputElement,
        this.stateController,
        this.stateController.allowGrayed,
        false,
        this.helper,
        container,
        this.storeValueInInput,
        key,
        this.disableCancelBubble,
        this.accessibilityCompliant
      );
    },
  });
  var EditorStyleDecoration = ASPx.CreateClass(null, {
    constructor: function (editor) {
      this.editor = editor;
      this.postfixList = [];
      this.styles = {};
      this.innerStyles = {};
      this.nullTextClassName = "";
    },
    GetStyleSheet: function () {
      return ASPx.GetCurrentStyleSheet();
    },
    AddPostfix: function (value, applyClass, applyBorders, applyBackground) {
      this.postfixList.push(value);
    },
    AddStyle: function (key, className, cssText) {
      this.styles[key] = this.CreateRule(className, cssText);
      this.innerStyles[key] = this.CreateRule("", this.FilterInnerCss(cssText));
    },
    CreateRule: function (className, cssText) {
      return ASPx.Str.Trim(
        className +
          " " +
          ASPx.CreateImportantStyleRule(this.GetStyleSheet(), cssText)
      );
    },
    Update: function () {
      for (var i = 0; i < this.postfixList.length; i++) {
        var postfix = this.postfixList[i];
        var inner = postfix.length > 0;
        var element = ASPx.GetElementById(this.editor.name + postfix);
        if (!element) continue;
        if (this.HasDecoration("I")) {
          var isValid = this.editor.GetIsValid();
          this.ApplyDecoration("I", element, inner, !isValid);
        }
        if (this.HasDecoration("F"))
          this.ApplyDecoration("F", element, inner, this.editor.focused);
        if (this.HasDecoration("N")) {
          var apply = !this.editor.focused;
          if (apply) {
            if (this.editor.CanApplyNullTextDecoration) {
              apply = this.editor.CanApplyNullTextDecoration();
            } else {
              var value = this.editor.GetValue();
              apply = apply && (value == null || value === "");
            }
          }
          if (apply) ASPx.Attr.ChangeAttribute(element, "spellcheck", "false");
          else ASPx.Attr.RestoreAttribute(element, "spellcheck");
          this.ApplyDecoration("N", element, inner, apply);
        }
      }
    },
    HasDecoration: function (key) {
      return !!this.styles[key];
    },
    ApplyNullTextClassName: function (active) {
      var nullTextClassName = this.GetNullTextClassName();
      var editorMainElement = this.editor.GetMainElement();
      if (active)
        ASPx.AddClassNameToElement(editorMainElement, nullTextClassName);
      else
        ASPx.RemoveClassNameFromElement(editorMainElement, nullTextClassName);
    },
    GetNullTextClassName: function () {
      if (!this.nullTextClassName) this.InitializeNullTextClassName();
      return this.nullTextClassName;
    },
    InitializeNullTextClassName: function () {
      var nullTextStyle = this.styles["N"];
      if (nullTextStyle) {
        var nullTextStyleClassNames = nullTextStyle.split(" ");
        for (var i = 0; i < nullTextStyleClassNames.length; i++)
          if (nullTextStyleClassNames[i].match("dxeNullText"))
            this.nullTextClassName = nullTextStyleClassNames[i];
      }
    },
    ApplyDecoration: function (key, element, inner, active) {
      var value = inner ? this.innerStyles[key] : this.styles[key];
      ASPx.RemoveClassNameFromElement(element, value);
      if (ASPx.Browser.IE && ASPx.Browser.MajorVersion >= 11)
        var reflow = element.offsetWidth;
      if (active) {
        ASPx.AddClassNameToElement(element, value);
        if (
          ASPx.Browser.IE &&
          ASPx.Browser.Version > 10 &&
          element.border != null
        ) {
          var border = parseInt(element.border) || 0;
          element.border = 1;
          element.border = border;
        }
      }
    },
    FilterInnerCss: function (css) {
      return css.replace(/(border|background-image)[^:]*:[^;]+/gi, "");
    },
  });
  var TouchUIHelper = {
    isGesture: false,
    isMouseEventFromScrolling: false,
    isNativeScrollingAllowed: true,
    clickSensetivity: 10,
    documentTouchHandlers: {},
    documentEventAttachingAllowed: true,
    msTouchDraggableClassName: "dxMSTouchDraggable",
    touchMouseDownEventName: ASPx.Browser.WebKitTouchUI
      ? "touchstart"
      : "mousedown",
    touchMouseUpEventName: ASPx.Browser.WebKitTouchUI ? "touchend" : "mouseup",
    touchMouseMoveEventName: ASPx.Browser.WebKitTouchUI
      ? "touchmove"
      : "mousemove",
    isTouchEvent: function (evt) {
      return ASPx.Browser.WebKitTouchUI && ASPx.IsExists(evt.changedTouches);
    },
    isTouchEventName: function (eventName) {
      return (
        ASPx.Browser.WebKitTouchUI &&
        (eventName.indexOf("touch") > -1 || eventName.indexOf("gesture") > -1)
      );
    },
    getEventX: function (evt) {
      return ASPx.Browser.IE ? evt.pageX : evt.changedTouches[0].pageX;
    },
    getEventY: function (evt) {
      return ASPx.Browser.IE ? evt.pageY : evt.changedTouches[0].pageY;
    },
    getWebkitMajorVersion: function () {
      if (!this.webkitMajorVersion) {
        var regExp = new RegExp("applewebkit/(\\d+)", "i");
        var matches = regExp.exec(ASPx.Browser.UserAgent);
        if (matches && matches.index >= 1) this.webkitMajorVersion = matches[1];
      }
      return this.webkitMajorVersion;
    },
    getIsLandscapeOrientation: function () {
      if (
        ASPx.Browser.MacOSMobilePlatform ||
        ASPx.Browser.AndroidMobilePlatform
      )
        return Math.abs(window.orientation) == 90;
      return ASPx.GetDocumentClientWidth() > ASPx.GetDocumentClientHeight();
    },
    nativeScrollingSupported: function () {
      var allowedSafariVersion =
        ASPx.Browser.Version >= 5.1 && ASPx.Browser.Version < 8;
      var allowedWebKitVersion =
        this.getWebkitMajorVersion() > 533 &&
        (ASPx.Browser.Chrome || this.getWebkitMajorVersion() < 600);
      return (
        (ASPx.Browser.MacOSMobilePlatform &&
          (allowedSafariVersion || allowedWebKitVersion)) ||
        (ASPx.Browser.AndroidMobilePlatform &&
          ASPx.Browser.PlaformMajorVersion >= 3) ||
        (ASPx.Browser.MSTouchUI &&
          (!ASPx.Browser.WindowsPhonePlatform || !ASPx.Browser.IE))
      );
    },
    makeScrollableIfRequired: function (element, options) {
      if (ASPx.Browser.WebKitTouchUI && element) {
        var overflow = ASPx.GetCurrentStyle(element).overflow;
        if (
          element.tagName == "DIV" &&
          overflow != "hidden" &&
          overflow != "visible"
        ) {
          return this.MakeScrollable(element);
        }
      }
    },
    preventScrollOnEvent: function (evt) {},
    handleFastTapIfRequired: function (evt, action, preventCommonClickEvents) {
      if (ASPx.Browser.WebKitTouchUI && evt.type == "touchstart" && action) {
        this.FastTapHelper.HandleFastTap(evt, action, preventCommonClickEvents);
        return true;
      }
      return false;
    },
    ensureDocumentSizesCorrect: function () {
      return (
        (document.documentElement.clientWidth -
          document.documentElement.clientHeight) /
          (screen.width - screen.height) >
        0
      );
    },
    ensureOrientationChanged: function (onOrientationChangedFunction) {
      if (ASPxClientUtils.iOSPlatform || this.ensureDocumentSizesCorrect())
        onOrientationChangedFunction();
      else {
        window.setTimeout(
          function () {
            this.ensureOrientationChanged(onOrientationChangedFunction);
          }.aspxBind(this),
          100
        );
      }
    },
    onEventAttachingToDocument: function (eventName, func) {
      if (
        ASPx.Browser.MacOSMobilePlatform &&
        this.isTouchEventName(eventName)
      ) {
        if (!this.documentTouchHandlers[eventName])
          this.documentTouchHandlers[eventName] = [];
        this.documentTouchHandlers[eventName].push(func);
        return this.documentEventAttachingAllowed;
      }
      return true;
    },
    onEventDettachedFromDocument: function (eventName, func) {
      if (
        ASPx.Browser.MacOSMobilePlatform &&
        this.isTouchEventName(eventName)
      ) {
        var handlers = this.documentTouchHandlers[eventName];
        if (handlers) ASPx.Data.ArrayRemove(handlers, func);
      }
    },
    processDocumentTouchEventHandlers: function (proc) {
      var touchEventNames = [
        "touchstart",
        "touchend",
        "touchmove",
        "gesturestart",
        "gestureend",
      ];
      for (var i = 0; i < touchEventNames.length; i++) {
        var eventName = touchEventNames[i];
        var handlers = this.documentTouchHandlers[eventName];
        if (handlers) {
          for (var j = 0; j < handlers.length; j++) {
            proc(eventName, handlers[j]);
          }
        }
      }
    },
    removeDocumentTouchEventHandlers: function () {
      if (ASPx.Browser.MacOSMobilePlatform) {
        this.documentEventAttachingAllowed = false;
        this.processDocumentTouchEventHandlers(
          ASPx.Evt.DetachEventFromDocumentCore
        );
      }
    },
    restoreDocumentTouchEventHandlers: function () {
      if (ASPx.Browser.MacOSMobilePlatform) {
        this.documentEventAttachingAllowed = true;
        this.processDocumentTouchEventHandlers(
          ASPx.Evt.AttachEventToDocumentCore
        );
      }
    },
    IsNativeScrolling: function () {
      return (
        TouchUIHelper.nativeScrollingSupported() &&
        TouchUIHelper.isNativeScrollingAllowed
      );
    },
    pointerEnabled: !!(window.PointerEvent || window.MSPointerEvent),
    pointerDownEventName: window.PointerEvent ? "pointerdown" : "MSPointerDown",
    pointerUpEventName: window.PointerEvent ? "pointerup" : "MSPointerUp",
    pointerCancelEventName: window.PointerEvent
      ? "pointercancel"
      : "MSPointerCancel",
    pointerMoveEventName: window.PointerEvent ? "pointermove" : "MSPointerMove",
    pointerOverEventName: window.PointerEvent ? "pointerover" : "MSPointerOver",
    pointerOutEventName: window.PointerEvent ? "pointerout" : "MSPointerOut",
    pointerType: {
      Touch: ASPx.Browser.IE && ASPx.Browser.Version == 10 ? 2 : "touch",
      Pen: ASPx.Browser.IE && ASPx.Browser.Version == 10 ? 3 : "pen",
      Mouse: ASPx.Browser.IE && ASPx.Browser.Version == 10 ? 4 : "mouse",
    },
    msGestureEnabled:
      !!(window.PointerEvent || window.MSPointerEvent) &&
      typeof MSGesture != "undefined",
    msTouchCreateGesturesWrapper: function (element, onTap) {
      if (!TouchUIHelper.msGestureEnabled) return;
      var gesture = new MSGesture();
      gesture.target = element;
      ASPx.Evt.AttachEventToElement(
        element,
        TouchUIHelper.pointerDownEventName,
        function (evt) {
          gesture.addPointer(evt.pointerId);
        }
      );
      ASPx.Evt.AttachEventToElement(
        element,
        TouchUIHelper.pointerUpEventName,
        function (evt) {
          gesture.stop();
        }
      );
      if (onTap) ASPx.Evt.AttachEventToElement(element, "MSGestureTap", onTap);
      return gesture;
    },
  };
  var CacheHelper = {};
  CacheHelper.GetCachedValueCore = function (
    obj,
    key,
    func,
    cacheObj,
    fillValueMethod
  ) {
    if (!cacheObj) cacheObj = obj;
    if (!cacheObj.cache) cacheObj.cache = {};
    if (!key) key = "default";
    fillValueMethod(obj, key, func, cacheObj);
    return cacheObj.cache[key];
  };
  CacheHelper.GetCachedValue = function (obj, key, func, cacheObj) {
    return CacheHelper.GetCachedValueCore(
      obj,
      key,
      func,
      cacheObj,
      function (obj, key, func, cacheObj) {
        if (!ASPx.IsExists(cacheObj.cache[key]))
          cacheObj.cache[key] = func.apply(obj, []);
      }
    );
  };
  CacheHelper.GetCachedElement = function (obj, key, func, cacheObj) {
    return CacheHelper.GetCachedValueCore(
      obj,
      key,
      func,
      cacheObj,
      function (obj, key, func, cacheObj) {
        if (!ASPx.IsValidElement(cacheObj.cache[key]))
          cacheObj.cache[key] = func.apply(obj, []);
      }
    );
  };
  CacheHelper.GetCachedElements = function (obj, key, func, cacheObj) {
    return CacheHelper.GetCachedValueCore(
      obj,
      key,
      func,
      cacheObj,
      function (obj, key, func, cacheObj) {
        if (!ASPx.IsValidElements(cacheObj.cache[key])) {
          var elements = func.apply(obj, []);
          if (!Ident.IsArray(elements)) elements = [elements];
          cacheObj.cache[key] = elements;
        }
      }
    );
  };
  CacheHelper.GetCachedElementById = function (obj, id, cacheObj) {
    return CacheHelper.GetCachedElement(
      obj,
      id,
      function () {
        return ASPx.GetElementById(id);
      },
      cacheObj
    );
  };
  CacheHelper.GetCachedChildById = function (obj, parent, id, cacheObj) {
    return CacheHelper.GetCachedElement(
      obj,
      id,
      function () {
        return ASPx.GetChildById(parent, id);
      },
      cacheObj
    );
  };
  CacheHelper.DropCachedValue = function (cacheObj, key) {
    cacheObj.cache[key] = null;
  };
  CacheHelper.DropCache = function (cacheObj) {
    cacheObj.cache = null;
  };
  var DomObserver = ASPx.CreateClass(null, {
    constructor: function () {
      this.items = {};
    },
    subscribe: function (elementID, callbackFunc) {
      var item = this.items[elementID];
      if (item) this.unsubscribe(elementID);
      item = {
        elementID: elementID,
        callbackFunc: callbackFunc,
        pauseCount: 0,
      };
      this.prepareItem(item);
      this.items[elementID] = item;
    },
    prepareItem: function (item) {},
    unsubscribe: function (elementID) {
      this.items[elementID] = null;
    },
    getItemElement: function (item) {
      var element = this.getElementById(item.elementID);
      if (element) return element;
      this.unsubscribe(item.elementID);
      return null;
    },
    getElementById: function (elementID) {
      var element = document.getElementById(elementID);
      return element && ASPx.IsValidElement(element) ? element : null;
    },
    pause: function (element, includeSubtree) {
      this.changeItemsState(element, includeSubtree, true);
    },
    resume: function (element, includeSubtree) {
      this.changeItemsState(element, includeSubtree, false);
    },
    forEachItem: function (processFunc, context) {
      context = context || this;
      for (var itemName in this.items) {
        if (!this.items.hasOwnProperty(itemName)) continue;
        var item = this.items[itemName];
        if (item) {
          var needBreak = processFunc.call(context, item);
          if (needBreak) return;
        }
      }
    },
    changeItemsState: function (element, includeSubtree, pause) {
      this.forEachItem(
        function (item) {
          if (!element) this.changeItemState(item, pause);
          else {
            var itemElement = this.getItemElement(item);
            if (
              itemElement &&
              (element == itemElement ||
                (includeSubtree && ASPx.GetIsParent(element, itemElement)))
            ) {
              this.changeItemState(item, pause);
              if (!includeSubtree) return true;
            }
          }
        }.aspxBind(this)
      );
    },
    changeItemState: function (item, pause) {
      if (pause) this.pauseItem(item);
      else this.resumeItem(item);
    },
    pauseItem: function (item) {
      item.paused = true;
      item.pauseCount++;
    },
    resumeItem: function (item) {
      if (item.pauseCount > 0) {
        if (item.pauseCount == 1) item.paused = false;
        item.pauseCount--;
      }
    },
  });
  DomObserver.IsMutationObserverAvailable = function () {
    return !!window.MutationObserver;
  };
  var TimerObserver = ASPx.CreateClass(DomObserver, {
    constructor: function () {
      this.constructor.prototype.constructor.call(this);
      this.timerID = -1;
      this.observationTimeout = 300;
    },
    subscribe: function (elementID, callbackFunc) {
      DomObserver.prototype.subscribe.call(this, elementID, callbackFunc);
      if (!this.isActivated()) this.startObserving();
    },
    isActivated: function () {
      return this.timerID !== -1;
    },
    startObserving: function () {
      if (this.isActivated()) window.clearTimeout(this.timerID);
      this.timerID = window.setTimeout(this.onTimeout, this.observationTimeout);
    },
    onTimeout: function () {
      var observer = _aspxGetDomObserver();
      observer.doObserve();
      observer.startObserving();
    },
    doObserve: function () {
      if (!ASPx.documentLoaded) return;
      this.forEachItem(
        function (item) {
          if (!item.paused) this.doObserveForItem(item);
        }.aspxBind(this)
      );
    },
    doObserveForItem: function (item) {
      var element = this.getItemElement(item);
      if (element) item.callbackFunc.call(this, element);
    },
  });
  var MutationObserver = ASPx.CreateClass(DomObserver, {
    constructor: function () {
      this.constructor.prototype.constructor.call(this);
      this.callbackTimeout = 10;
    },
    prepareItem: function (item) {
      item.callbackTimerID = -1;
      var target = this.getElementById(item.elementID);
      if (!target) return;
      var observerCallbackFunc = function () {
        if (item.callbackTimerID === -1) {
          var timeoutHander = function () {
            item.callbackTimerID = -1;
            item.callbackFunc.call(this, target);
          }.aspxBind(this);
          item.callbackTimerID = window.setTimeout(
            timeoutHander,
            this.callbackTimeout
          );
        }
      }.aspxBind(this);
      var observer = new window.MutationObserver(observerCallbackFunc);
      var config = {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true,
      };
      observer.observe(target, config);
      item.observer = observer;
      item.config = config;
    },
    unsubscribe: function (elementID) {
      var item = this.items[elementID];
      if (item) {
        item.observer.disconnect();
        item.observer = null;
      }
      this.constructor.prototype.unsubscribe.call(this, elementID);
    },
    pauseItem: function (item) {
      this.constructor.prototype.pauseItem.call(this, item);
      item.observer.disconnect();
    },
    resumeItem: function (item) {
      this.constructor.prototype.resumeItem.call(this, item);
      if (!item.paused) {
        var target = this.getItemElement(item);
        if (target) item.observer.observe(target, item.config);
      }
    },
  });
  var domObserver = null;
  function _aspxGetDomObserver() {
    if (domObserver == null)
      domObserver = DomObserver.IsMutationObserverAvailable()
        ? new MutationObserver()
        : new TimerObserver();
    return domObserver;
  }
  var ControlUpdateWatcher = ASPx.CreateClass(null, {
    constructor: function () {
      this.helpers = {};
      this.clearLockerTimerID = -1;
      this.clearLockerTimerDelay = 15;
      this.postProcessing = false;
      this.init();
    },
    init: function () {
      var postHandler = aspxGetPostHandler();
      postHandler.Post.AddHandler(this.OnPost, this);
    },
    Add: function (helper) {
      this.helpers[helper.GetName()] = helper;
    },
    CanSendCallback: function (dxCallbackOwner, arg) {
      this.LockConfirmOnBeforeWindowUnload();
      var modifiedHelpers = this.FilterModifiedHelpersByDXCallbackOwner(
        this.GetModifiedHelpers(),
        dxCallbackOwner,
        arg
      );
      if (modifiedHelpers.length === 0) return true;
      var modifiedHelpersInfo = this.GetToConfirmAndToResetLists(
        modifiedHelpers,
        dxCallbackOwner.name
      );
      if (!modifiedHelpersInfo) return true;
      if (modifiedHelpersInfo.toConfirm.length === 0) {
        this.ResetClientChanges(modifiedHelpersInfo.toReset);
        return true;
      }
      var helper = modifiedHelpersInfo.toConfirm[0];
      if (!confirm(helper.GetConfirmUpdateText())) return false;
      this.ResetClientChanges(modifiedHelpersInfo.toReset);
      return true;
    },
    OnPost: function (s, e) {
      if (e.isDXCallback) return;
      this.postProcessing = true;
      this.LockConfirmOnBeforeWindowUnload();
      var modifiedHelpersInfo = this.GetModifedHelpersInfo(e);
      if (!modifiedHelpersInfo) return;
      if (modifiedHelpersInfo.toConfirm.length === 0) {
        this.ResetClientChanges(modifiedHelpersInfo.toReset);
        return;
      }
      var helper = modifiedHelpersInfo.toConfirm[0];
      if (!confirm(helper.GetConfirmUpdateText())) {
        e.cancel = true;
        this.finishPostProcessing();
      }
      if (!e.cancel) this.ResetClientChanges(modifiedHelpersInfo.toReset);
    },
    finishPostProcessing: function () {
      this.postProcessing = false;
    },
    GetModifedHelpersInfo: function (e) {
      var modifiedHelpers = this.FilterModifiedHelpers(
        this.GetModifiedHelpers(),
        e
      );
      if (modifiedHelpers.length === 0) return;
      return this.GetToConfirmAndToResetLists(modifiedHelpers, e && e.ownerID);
    },
    GetToConfirmAndToResetLists: function (modifiedHelpers, ownerID) {
      var resetList = [];
      var confirmList = [];
      for (var i = 0; i < modifiedHelpers.length; i++) {
        var helper = modifiedHelpers[i];
        if (!helper.GetConfirmUpdateText()) {
          resetList.push(helper);
          continue;
        }
        if (helper.CanShowConfirm(ownerID)) {
          resetList.push(helper);
          confirmList.push(helper);
        }
      }
      return { toConfirm: confirmList, toReset: resetList };
    },
    FilterModifiedHelpers: function (modifiedHelpers, e) {
      if (modifiedHelpers.length === 0) return [];
      if (this.RequireProcessUpdatePanelCallback(e))
        return this.FilterModifiedHelpersByUpdatePanels(modifiedHelpers);
      if (this.postProcessing)
        return this.FilterModifiedHelpersByPostback(modifiedHelpers);
      return modifiedHelpers;
    },
    FilterModifiedHelpersByDXCallbackOwner: function (
      modifiedHelpers,
      dxCallbackOwner,
      arg
    ) {
      var result = [];
      for (var i = 0; i < modifiedHelpers.length; i++) {
        var helper = modifiedHelpers[i];
        if (helper.NeedConfirmOnCallback(dxCallbackOwner, arg))
          result.push(helper);
      }
      return result;
    },
    FilterModifiedHelpersByUpdatePanels: function (modifiedHelpers) {
      var result = [];
      var updatePanels = this.GetUpdatePanelsWaitedForUpdate();
      for (var i = 0; i < updatePanels.length; i++) {
        var panelID = updatePanels[i].replace(/\$/g, "_");
        var panel = ASPx.GetElementById(panelID);
        if (!panel) continue;
        for (var j = 0; j < modifiedHelpers.length; j++) {
          var helper = modifiedHelpers[j];
          if (ASPx.GetIsParent(panel, helper.GetControlMainElement()))
            result.push(helper);
        }
      }
      return result;
    },
    FilterModifiedHelpersByPostback: function (modifiedHelpers) {
      var result = [];
      for (var i = 0; i < modifiedHelpers.length; i++) {
        var helper = modifiedHelpers[i];
        if (helper.NeedConfirmOnPostback()) result.push(helper);
      }
      return result;
    },
    RequireProcessUpdatePanelCallback: function (e) {
      var rManager = this.GetMSRequestManager();
      if (rManager && e && e.isMSAjaxCallback)
        return rManager._postBackSettings.async;
      return false;
    },
    GetUpdatePanelsWaitedForUpdate: function () {
      var rManager = this.GetMSRequestManager();
      if (!rManager) return [];
      var panelUniqueIDs = rManager._postBackSettings.panelsToUpdate || [];
      var panelClientIDs = [];
      for (var i = 0; i < panelUniqueIDs.length; i++) {
        var index = ASPx.Data.ArrayIndexOf(
          rManager._updatePanelIDs,
          panelUniqueIDs[i]
        );
        if (index >= 0)
          panelClientIDs.push(rManager._updatePanelClientIDs[index]);
      }
      return panelClientIDs;
    },
    GetMSRequestManager: function () {
      if (
        window.Sys &&
        Sys.WebForms &&
        Sys.WebForms.PageRequestManager &&
        Sys.WebForms.PageRequestManager.getInstance
      )
        return Sys.WebForms.PageRequestManager.getInstance();
      return null;
    },
    GetModifiedHelpers: function () {
      var result = [];
      for (var key in this.helpers) {
        var helper = this.helpers[key];
        if (helper.HasChanges()) result.push(helper);
      }
      return result;
    },
    ResetClientChanges: function (modifiedHelpers) {
      for (var i = 0; i < modifiedHelpers.length; i++)
        modifiedHelpers[i].ResetClientChanges();
    },
    GetConfirmUpdateMessage: function () {
      if (this.confirmOnWindowUnloadLocked) return;
      var modifiedHelpersInfo = this.GetModifedHelpersInfo();
      if (!modifiedHelpersInfo || modifiedHelpersInfo.toConfirm.length === 0)
        return;
      var helper = modifiedHelpersInfo.toConfirm[0];
      return helper.GetConfirmUpdateText();
    },
    LockConfirmOnBeforeWindowUnload: function () {
      this.confirmOnWindowUnloadLocked = true;
      this.clearLockerTimerID = ASPx.Timer.ClearTimer(this.clearLockerTimerID);
      this.clearLockerTimerID = window.setTimeout(
        function () {
          this.confirmOnWindowUnloadLocked = false;
        }.aspxBind(this),
        this.clearLockerTimerDelay
      );
    },
    OnWindowBeforeUnload: function (e) {
      var confirmMessage = this.GetConfirmUpdateMessage();
      if (confirmMessage) e.returnValue = confirmMessage;
      this.finishPostProcessing();
      return confirmMessage;
    },
    OnWindowUnload: function (e) {
      if (this.confirmOnWindowUnloadLocked) return;
      var modifiedHelpersInfo = this.GetModifedHelpersInfo();
      if (!modifiedHelpersInfo) return;
      this.ResetClientChanges(modifiedHelpersInfo.toReset);
    },
    OnMouseDown: function (e) {
      if (ASPx.Browser.IE) this.PreventBeforeUnloadOnLinkClick(e);
    },
    OnFocusIn: function (e) {
      if (ASPx.Browser.IE) this.PreventBeforeUnloadOnLinkClick(e);
    },
    PreventBeforeUnloadOnLinkClick: function (e) {
      if (ASPx.GetObjectKeys(this.helpers).length == 0) return;
      var link = ASPx.GetParentByTagName(ASPx.Evt.GetEventSource(e), "A");
      if (!link || link.dxgvLinkClickHanlderAssigned) return;
      var url = ASPx.Attr.GetAttribute(link, "href");
      if (!url || url.indexOf("javascript:") < 0) return;
      ASPx.Evt.AttachEventToElement(link, "click", function (ev) {
        return ASPx.Evt.PreventEvent(ev);
      });
      link.dxgvLinkClickHanlderAssigned = true;
    },
  });
  ControlUpdateWatcher.Instance = null;
  ControlUpdateWatcher.getInstance = function () {
    if (!ControlUpdateWatcher.Instance) {
      ControlUpdateWatcher.Instance = new ControlUpdateWatcher();
      ASPx.Evt.AttachEventToElement(window, "beforeunload", function (e) {
        return ControlUpdateWatcher.Instance.OnWindowBeforeUnload(e);
      });
      ASPx.Evt.AttachEventToElement(window, "unload", function (e) {
        ControlUpdateWatcher.Instance.OnWindowUnload(e);
      });
      ASPx.Evt.AttachEventToDocument("mousedown", function (e) {
        ControlUpdateWatcher.Instance.OnMouseDown(e);
      });
      ASPx.Evt.AttachEventToDocument("focusin", function (e) {
        ControlUpdateWatcher.Instance.OnFocusIn(e);
      });
    }
    return ControlUpdateWatcher.Instance;
  };
  var UpdateWatcherHelper = ASPx.CreateClass(null, {
    constructor: function (owner) {
      this.owner = owner;
      this.ownerWatcher = ControlUpdateWatcher.getInstance();
      this.ownerWatcher.Add(this);
    },
    GetName: function () {
      return this.owner.name;
    },
    GetControlMainElement: function () {
      return this.owner.GetMainElement();
    },
    CanShowConfirm: function (requestOwnerID) {
      return true;
    },
    HasChanges: function () {
      return false;
    },
    GetConfirmUpdateText: function () {
      return "";
    },
    NeedConfirmOnCallback: function (dxCallbackOwner) {
      return true;
    },
    NeedConfirmOnPostback: function () {
      return true;
    },
    ResetClientChanges: function () {},
    ConfirmOnCustomControlEvent: function () {
      var confirmMessage = this.GetConfirmUpdateText();
      if (confirmMessage) return confirm(confirmMessage);
      return false;
    },
  });
  var ControlCallbackQueueHelper = ASPx.CreateClass(null, {
    constructor: function (owner) {
      this.owner = owner;
      this.pendingCallbacks = [];
      this.receivedCallbacks = [];
      this.attachEvents();
    },
    showLoadingElements: function () {
      this.owner.ShowLoadingDiv();
      if (this.owner.IsCallbackAnimationEnabled())
        this.owner.StartBeginCallbackAnimation();
      else this.owner.ShowLoadingElementsInternal();
    },
    attachEvents: function () {
      this.owner.EndCallback.AddHandler(this.onEndCallback.aspxBind(this));
      this.owner.CallbackError.AddHandler(this.onCallbackError.aspxBind(this));
    },
    detachEvents: function () {
      this.owner.EndCallback.RemoveHandler(this.onEndCallback);
      this.owner.CallbackError.RemoveHandler(this.onCallbackError);
    },
    onCallbackError: function (owner, result) {
      this.sendErrorToChildControl(result);
    },
    ignoreDuplicates: function () {
      return true;
    },
    hasDuplicate: function (arg) {
      for (var i in this.pendingCallbacks) {
        if (
          this.pendingCallbacks[i].arg == arg &&
          this.pendingCallbacks[i].state != ASPx.callbackState.aborted
        )
          return true;
      }
      return false;
    },
    getToken: function (halperContext, callbackInfo) {
      return {
        cancel: function () {
          if (callbackInfo.state == ASPx.callbackState.sent) {
            callbackInfo.state = ASPx.callbackState.aborted;
            halperContext.sendNext();
          }
          if (callbackInfo.state == ASPx.callbackState.inTurn)
            ASPx.Data.ArrayRemove(halperContext.pendingCallbacks, callbackInfo);
        },
        callbackId: -1,
      };
    },
    sendCallback: function (arg, handlerContext, handler) {
      if (this.ignoreDuplicates() && this.hasDuplicate(arg)) return false;
      var handlerContext = handlerContext || this.owner;
      var callbackInfo = {
        arg: arg,
        handlerContext: handlerContext,
        handler: handler || handlerContext.OnCallback,
        state: ASPx.callbackState.inTurn,
        callbackId: -1,
      };
      this.pendingCallbacks.push(callbackInfo);
      if (!this.hasActiveCallback()) {
        callbackInfo.callbackId = this.owner.CreateCallback(arg);
        callbackInfo.state = ASPx.callbackState.sent;
      }
      return this.getToken(this, callbackInfo);
    },
    hasActiveCallback: function () {
      return this.getCallbacksInfoByState(ASPx.callbackState.sent).length > 0;
    },
    sendNext: function () {
      var nextCallbackInfo = this.getCallbacksInfoByState(
        ASPx.callbackState.inTurn
      )[0];
      if (nextCallbackInfo) {
        nextCallbackInfo.callbackId = this.owner.CreateCallback(
          nextCallbackInfo.arg
        );
        nextCallbackInfo.state = ASPx.callbackState.sent;
        return nextCallbackInfo.callbackId;
      }
    },
    onEndCallback: function () {
      if (!this.owner.isErrorOnCallback && this.hasPendingCallbacks()) {
        var curCallbackId;
        var curCallbackInfo;
        var handlerContext;
        for (var i in this.receivedCallbacks) {
          curCallbackId = this.receivedCallbacks[i];
          curCallbackInfo = this.getCallbackInfoById(curCallbackId);
          if (curCallbackInfo.state != ASPx.callbackState.aborted) {
            handlerContext = curCallbackInfo.handlerContext;
            if (handlerContext.OnEndCallback) handlerContext.OnEndCallback();
            this.sendNext();
          }
          ASPx.Data.ArrayRemove(this.pendingCallbacks, curCallbackInfo);
        }
        ASPx.Data.ArrayClear(this.receivedCallbacks);
      }
    },
    hasPendingCallbacks: function () {
      return (
        this.pendingCallbacks &&
        this.pendingCallbacks.length &&
        this.pendingCallbacks.length > 0
      );
    },
    processCallback: function (result, callbackId) {
      this.receivedCallbacks.push(callbackId);
      if (this.hasPendingCallbacks()) {
        var callbackInfo = this.getCallbackInfoById(callbackId);
        if (callbackInfo.state != ASPx.callbackState.aborted)
          callbackInfo.handler.call(callbackInfo.handlerContext, result);
      }
    },
    getCallbackInfoById: function (id) {
      for (var i in this.pendingCallbacks) {
        if (this.pendingCallbacks[i].callbackId == id)
          return this.pendingCallbacks[i];
      }
    },
    getCallbacksInfoByState: function (state) {
      var result = [];
      for (var i in this.pendingCallbacks) {
        if (this.pendingCallbacks[i].state == state)
          result.push(this.pendingCallbacks[i]);
      }
      return result;
    },
    sendErrorToChildControl: function (callbackObj) {
      if (this.hasPendingCallbacks()) {
        var callbackInfo = this.getCallbackInfoById(callbackObj.callbackId);
        if (callbackInfo) {
          var hasChildControlHandler =
            callbackInfo.handlerContext != this.owner &&
            callbackInfo.handlerContext.OnCallbackError;
          if (hasChildControlHandler)
            callbackInfo.handlerContext.OnCallbackError.call(
              callbackInfo.handlerContext,
              callbackObj.message,
              callbackObj.data
            );
        }
      }
    },
  });
  var AccessibilityHelperBase = ASPx.CreateClass(null, {
    constructor: function (control) {
      this.control = control;
      this.timerID = -1;
      this.pronounceMessageTimeout = 500;
      this.activeItem = this.getItems()[0];
    },
    PronounceMessage: function (
      text,
      activeItemArgs,
      inactiveItemArgs,
      mainElementArgs,
      ownerMainElement
    ) {
      this.timerID = ASPx.Timer.ClearTimer(this.timerID);
      this.timerID = window.setTimeout(
        function () {
          this.PronounceMessageCore(
            text,
            activeItemArgs,
            inactiveItemArgs,
            mainElementArgs,
            ownerMainElement
          );
        }.aspxBind(this),
        this.getPronounceTimeout()
      );
    },
    PronounceMessageCore: function (
      text,
      activeItemArgs,
      inactiveItemArgs,
      mainElementArgs,
      ownerMainElement
    ) {
      this.toogleItem();
      var mainElement = this.getMainElement();
      var activeItem = this.getItem(true);
      var inactiveItem = this.getItem();
      mainElementArgs = this.addArguments(mainElementArgs, {
        "aria-activedescendant": activeItem.id,
      });
      activeItemArgs = this.addArguments(activeItemArgs, {
        "aria-label": text,
      });
      inactiveItemArgs = this.addArguments(inactiveItemArgs, {
        "aria-label": "",
      });
      this.changeActivityAttributes(activeItem, activeItemArgs);
      this.changeActivityAttributes(mainElement, mainElementArgs);
      if (!!ownerMainElement)
        this.changeActivityAttributes(ownerMainElement, {
          "aria-activedescendant": activeItem.id,
        });
      this.changeActivityAttributes(inactiveItem, inactiveItemArgs);
    },
    getMainElement: function () {
      if (!ASPx.IsExistsElement(this.mainElement))
        this.mainElement = this.control.GetAccessibilityServiceElement();
      return this.mainElement;
    },
    getItems: function () {
      if (!ASPx.IsExistsElement(this.items))
        this.items = ASPx.GetChildElementNodes(this.getMainElement());
      return this.items;
    },
    getItem: function (isActive) {
      if (isActive) return this.activeItem;
      var items = this.getItems();
      return items[0] === this.activeItem ? items[1] : items[0];
    },
    getPronounceTimeout: function () {
      return this.pronounceMessageTimeout;
    },
    toogleItem: function () {
      this.activeItem = this.getItem();
    },
    addArguments: function (targetArgs, newArgs) {
      if (!targetArgs) targetArgs = {};
      for (key in newArgs) {
        if (!targetArgs.hasOwnProperty(key)) targetArgs[key] = newArgs[key];
      }
      return targetArgs;
    },
    changeActivityAttributes: function (element, args) {
      for (key in args) {
        var value = args[key];
        var action =
          value !== "" ? ASPx.Attr.SetAttribute : ASPx.Attr.RemoveAttribute;
        action(element, key, value);
      }
    },
  });
  var EventStorage = ASPx.CreateClass(null, {
    constructor: function () {
      this.bag = {};
    },
    Save: function (e, data, overwrite) {
      var key = this.getEventKey(e);
      if (this.bag.hasOwnProperty(key) && !overwrite) return;
      this.bag[key] = data;
      window.setTimeout(
        function () {
          delete this.bag[key];
        }.aspxBind(this),
        100
      );
    },
    Load: function (e) {
      var key = this.getEventKey(e);
      return this.bag[key];
    },
    getEventKey: function (e) {
      if (ASPx.IsExists(e.timeStamp)) return e.timeStamp.toString();
      var eventSource = ASPx.Evt.GetEventSource(e);
      var type = e.type.toString();
      return eventSource ? type + "_" + eventSource.uniqueID.toString() : type;
    },
  });
  EventStorage.Instance = null;
  EventStorage.getInstance = function () {
    if (!EventStorage.Instance) EventStorage.Instance = new EventStorage();
    return EventStorage.Instance;
  };
  ASPx.GetControlCollection = aspxGetControlCollection;
  ASPx.GetControlCollectionCollection = aspxGetControlCollectionCollection;
  ASPx.GetPersistentControlPropertiesStorage =
    _aspxGetPersistentControlPropertiesStorage;
  ASPx.FunctionIsInCallstack = _aspxFunctionIsInCallstack;
  ASPx.RaisePostHandlerOnPost = aspxRaisePostHandlerOnPost;
  ASPx.GetPostHandler = aspxGetPostHandler;
  ASPx.ProcessScriptsAndLinks = _aspxProcessScriptsAndLinks;
  ASPx.InitializeLinks = _aspxInitializeLinks;
  ASPx.InitializeScripts = _aspxInitializeScripts;
  ASPx.RunStartupScripts = _aspxRunStartupScripts;
  ASPx.AddScriptsRestartHandler = _aspxAddScriptsRestartHandler;
  ASPx.GetFocusedElement = _aspxGetFocusedElement;
  ASPx.GetDomObserver = _aspxGetDomObserver;
  ASPx.CacheHelper = CacheHelper;
  ASPx.PagerCommands = PagerCommands;
  ASPx.ResourceManager = ResourceManager;
  ASPx.UpdateWatcherHelper = UpdateWatcherHelper;
  ASPx.EventStorage = EventStorage;
  ASPx.CheckBoxCheckState = CheckBoxCheckState;
  ASPx.CheckBoxInputKey = CheckBoxInputKey;
  ASPx.CheckableElementStateController = CheckableElementStateController;
  ASPx.CheckableElementHelper = CheckableElementHelper;
  ASPx.CheckBoxInternal = CheckBoxInternal;
  ASPx.CheckBoxInternalCollection = CheckBoxInternalCollection;
  ASPx.ControlCallbackQueueHelper = ControlCallbackQueueHelper;
  ASPx.EditorStyleDecoration = EditorStyleDecoration;
  ASPx.AccessibilitySR = {};
  ASPx.KbdHelper = KbdHelper;
  ASPx.IFrameHelper = IFrameHelper;
  ASPx.Ident = Ident;
  ASPx.TouchUIHelper = TouchUIHelper;
  ASPx.AccessibilityHelperBase = AccessibilityHelperBase;
  window.ASPxClientEvent = ASPxClientEvent;
  window.ASPxClientEventArgs = ASPxClientEventArgs;
  window.ASPxClientCancelEventArgs = ASPxClientCancelEventArgs;
  window.ASPxClientProcessingModeEventArgs = ASPxClientProcessingModeEventArgs;
  window.ASPxClientProcessingModeCancelEventArgs =
    ASPxClientProcessingModeCancelEventArgs;
  window.ASPxClientBeginCallbackEventArgs = ASPxClientBeginCallbackEventArgs;
  window.ASPxClientGlobalBeginCallbackEventArgs =
    ASPxClientGlobalBeginCallbackEventArgs;
  window.ASPxClientEndCallbackEventArgs = ASPxClientEndCallbackEventArgs;
  window.ASPxClientGlobalEndCallbackEventArgs =
    ASPxClientGlobalEndCallbackEventArgs;
  window.ASPxClientCallbackErrorEventArgs = ASPxClientCallbackErrorEventArgs;
  window.ASPxClientGlobalCallbackErrorEventArgs =
    ASPxClientGlobalCallbackErrorEventArgs;
  window.ASPxClientCustomDataCallbackEventArgs =
    ASPxClientCustomDataCallbackEventArgs;
  window.ASPxClientValidationCompletedEventArgs =
    ASPxClientValidationCompletedEventArgs;
  window.ASPxClientControlsInitializedEventArgs =
    ASPxClientControlsInitializedEventArgs;
  window.ASPxClientControlCollection = ASPxClientControlCollection;
  window.ASPxClientControl = ASPxClientControl;
  window.ASPxClientComponent = ASPxClientComponent;
  ASPx.classesScriptParsed = true;
})();
(function () {
  ASPx.StateItemsExist = false;
  ASPx.FocusedItemKind = "FocusedStateItem";
  ASPx.HoverItemKind = "HoverStateItem";
  ASPx.PressedItemKind = "PressedStateItem";
  ASPx.SelectedItemKind = "SelectedStateItem";
  ASPx.DisabledItemKind = "DisabledStateItem";
  ASPx.CachedStatePrefix = "cached";
  ASPxStateItem = ASPx.CreateClass(null, {
    constructor: function (
      name,
      classNames,
      cssTexts,
      postfixes,
      imageObjs,
      imagePostfixes,
      kind,
      disableApplyingStyleToLink
    ) {
      this.name = name;
      this.classNames = classNames;
      this.customClassNames = [];
      this.resultClassNames = [];
      this.cssTexts = cssTexts;
      this.postfixes = postfixes;
      this.imageObjs = imageObjs;
      this.imagePostfixes = imagePostfixes;
      this.kind = kind;
      this.classNamePostfix = kind.substr(0, 1).toLowerCase();
      this.enabled = true;
      this.needRefreshBetweenElements = false;
      this.elements = null;
      this.images = null;
      this.links = [];
      this.linkColor = null;
      this.linkTextDecoration = null;
      this.disableApplyingStyleToLink = !!disableApplyingStyleToLink;
    },
    GetCssText: function (index) {
      if (ASPx.IsExists(this.cssTexts[index])) return this.cssTexts[index];
      return this.cssTexts[0];
    },
    CreateStyleRule: function (index) {
      if (this.GetCssText(index) == "") return "";
      var styleSheet = ASPx.GetCurrentStyleSheet();
      if (styleSheet)
        return ASPx.CreateImportantStyleRule(
          styleSheet,
          this.GetCssText(index),
          this.classNamePostfix
        );
      return "";
    },
    GetClassName: function (index) {
      if (ASPx.IsExists(this.classNames[index])) return this.classNames[index];
      return this.classNames[0];
    },
    GetResultClassName: function (index) {
      if (!ASPx.IsExists(this.resultClassNames[index])) {
        if (!ASPx.IsExists(this.customClassNames[index]))
          this.customClassNames[index] = this.CreateStyleRule(index);
        if (
          this.GetClassName(index) != "" &&
          this.customClassNames[index] != ""
        )
          this.resultClassNames[index] =
            this.GetClassName(index) + " " + this.customClassNames[index];
        else if (this.GetClassName(index) != "")
          this.resultClassNames[index] = this.GetClassName(index);
        else if (this.customClassNames[index] != "")
          this.resultClassNames[index] = this.customClassNames[index];
        else this.resultClassNames[index] = "";
      }
      return this.resultClassNames[index];
    },
    GetElements: function (element) {
      if (!this.elements || !ASPx.IsValidElements(this.elements)) {
        if (this.postfixes && this.postfixes.length > 0) {
          this.elements = [];
          var parentNode = element.parentNode;
          if (parentNode) {
            for (var i = 0; i < this.postfixes.length; i++) {
              var id = this.name + this.postfixes[i];
              this.elements[i] = ASPx.GetChildById(parentNode, id);
              if (!this.elements[i]) this.elements[i] = ASPx.GetElementById(id);
            }
          }
        } else this.elements = [element];
      }
      return this.elements;
    },
    GetImages: function (element) {
      if (!this.images || !ASPx.IsValidElements(this.images)) {
        this.images = [];
        if (this.imagePostfixes && this.imagePostfixes.length > 0) {
          var elements = this.GetElements(element);
          for (var i = 0; i < this.imagePostfixes.length; i++) {
            var id = this.name + this.imagePostfixes[i];
            for (var j = 0; j < elements.length; j++) {
              if (!elements[j]) continue;
              if (elements[j].id == id) this.images[i] = elements[j];
              else this.images[i] = ASPx.GetChildById(elements[j], id);
              if (this.images[i]) break;
            }
          }
        }
      }
      return this.images;
    },
    Apply: function (element) {
      if (!this.enabled) return;
      try {
        this.ApplyStyle(element);
        if (this.imageObjs && this.imageObjs.length > 0)
          this.ApplyImage(element);
        if (ASPx.Browser.IE && ASPx.Browser.MajorVersion >= 11)
          this.ForceRedrawAppearance(element);
      } catch (e) {}
    },
    ApplyStyle: function (element) {
      var elements = this.GetElements(element);
      for (var i = 0; i < elements.length; i++) {
        if (!elements[i]) continue;
        var className = elements[i].className.replace(
          this.GetResultClassName(i),
          ""
        );
        elements[i].className =
          ASPx.Str.Trim(className) + " " + this.GetResultClassName(i);
        if (!ASPx.Browser.Opera || ASPx.Browser.Version >= 9)
          this.ApplyStyleToLinks(elements, i);
      }
    },
    ApplyStyleToLinks: function (elements, index) {
      if (this.disableApplyingStyleToLink) return;
      if (!ASPx.IsValidElements(this.links[index]))
        this.links[index] = ASPx.GetNodesByTagName(elements[index], "A");
      for (var i = 0; i < this.links[index].length; i++)
        this.ApplyStyleToLinkElement(this.links[index][i], index);
    },
    ApplyStyleToLinkElement: function (link, index) {
      if (this.GetLinkColor(index) != "")
        ASPx.Attr.ChangeAttributeExtended(
          link.style,
          "color",
          link,
          "saved" + this.kind + "Color",
          this.GetLinkColor(index)
        );
      if (this.GetLinkTextDecoration(index) != "")
        ASPx.Attr.ChangeAttributeExtended(
          link.style,
          "textDecoration",
          link,
          "saved" + this.kind + "TextDecoration",
          this.GetLinkTextDecoration(index)
        );
    },
    ApplyImage: function (element) {
      var images = this.GetImages(element);
      for (var i = 0; i < images.length; i++) {
        if (!images[i] || !this.imageObjs[i]) continue;
        var useSpriteImage = typeof this.imageObjs[i] != "string";
        var newUrl = "",
          newCssClass = "",
          newBackground = "";
        if (useSpriteImage) {
          newUrl = ASPx.EmptyImageUrl;
          if (this.imageObjs[i].spriteCssClass)
            newCssClass = this.imageObjs[i].spriteCssClass;
          if (this.imageObjs[i].spriteBackground)
            newBackground = this.imageObjs[i].spriteBackground;
        } else {
          newUrl = this.imageObjs[i];
          if (ASPx.Attr.IsExistsAttribute(images[i].style, "background"))
            newBackground = " ";
        }
        if (newUrl != "")
          ASPx.Attr.ChangeAttributeExtended(
            images[i],
            "src",
            images[i],
            "saved" + this.kind + "Src",
            newUrl
          );
        if (newCssClass != "") this.ApplyImageClassName(images[i], newCssClass);
        if (newBackground != "") {
          if (ASPx.Browser.WebKitFamily) {
            var savedBackground = ASPx.Attr.GetAttribute(
              images[i].style,
              "background"
            );
            if (!useSpriteImage)
              savedBackground += " " + images[i].style["backgroundPosition"];
            ASPx.Attr.SetAttribute(
              images[i],
              "saved" + this.kind + "Background",
              savedBackground
            );
            ASPx.Attr.SetAttribute(
              images[i].style,
              "background",
              newBackground
            );
          } else
            ASPx.Attr.ChangeAttributeExtended(
              images[i].style,
              "background",
              images[i],
              "saved" + this.kind + "Background",
              newBackground
            );
        }
      }
    },
    ApplyImageClassName: function (element, newClassName) {
      var className = element.className.replace(newClassName, "");
      ASPx.Attr.SetAttribute(
        element,
        "saved" + this.kind + "ClassName",
        className
      );
      element.className = className + " " + newClassName;
    },
    Cancel: function (element) {
      if (!this.enabled) return;
      try {
        if (this.imageObjs && this.imageObjs.length > 0)
          this.CancelImage(element);
        this.CancelStyle(element);
      } catch (e) {}
    },
    CancelStyle: function (element) {
      var elements = this.GetElements(element);
      for (var i = 0; i < elements.length; i++) {
        if (!elements[i]) continue;
        var className = ASPx.Str.Trim(
          elements[i].className.replace(this.GetResultClassName(i), "")
        );
        elements[i].className = className;
        if (!ASPx.Browser.Opera || ASPx.Browser.Version >= 9)
          this.CancelStyleFromLinks(elements, i);
      }
    },
    CancelStyleFromLinks: function (elements, index) {
      if (this.disableApplyingStyleToLink) return;
      if (!ASPx.IsValidElements(this.links[index]))
        this.links[index] = ASPx.GetNodesByTagName(elements[index], "A");
      for (var i = 0; i < this.links[index].length; i++)
        this.CancelStyleFromLinkElement(this.links[index][i], index);
    },
    CancelStyleFromLinkElement: function (link, index) {
      if (this.GetLinkColor(index) != "")
        ASPx.Attr.RestoreAttributeExtended(
          link.style,
          "color",
          link,
          "saved" + this.kind + "Color"
        );
      if (this.GetLinkTextDecoration(index) != "")
        ASPx.Attr.RestoreAttributeExtended(
          link.style,
          "textDecoration",
          link,
          "saved" + this.kind + "TextDecoration"
        );
    },
    CancelImage: function (element) {
      var images = this.GetImages(element);
      for (var i = 0; i < images.length; i++) {
        if (!images[i] || !this.imageObjs[i]) continue;
        ASPx.Attr.RestoreAttributeExtended(
          images[i],
          "src",
          images[i],
          "saved" + this.kind + "Src"
        );
        this.CancelImageClassName(images[i]);
        ASPx.Attr.RestoreAttributeExtended(
          images[i].style,
          "background",
          images[i],
          "saved" + this.kind + "Background"
        );
      }
    },
    CancelImageClassName: function (element) {
      var savedClassName = ASPx.Attr.GetAttribute(
        element,
        "saved" + this.kind + "ClassName"
      );
      if (ASPx.IsExists(savedClassName)) {
        element.className = savedClassName;
        ASPx.Attr.RemoveAttribute(element, "saved" + this.kind + "ClassName");
      }
    },
    Clone: function () {
      return new ASPxStateItem(
        this.name,
        this.classNames,
        this.cssTexts,
        this.postfixes,
        this.imageObjs,
        this.imagePostfixes,
        this.kind,
        this.disableApplyingStyleToLink
      );
    },
    IsChildElement: function (element) {
      if (element != null) {
        var elements = this.GetElements(element);
        for (var i = 0; i < elements.length; i++) {
          if (!elements[i]) continue;
          if (ASPx.GetIsParent(elements[i], element)) return true;
        }
      }
      return false;
    },
    ForceRedrawAppearance: function (element) {
      var value = element.style.opacity;
      element.style.opacity = "0.7777";
      var dummy = element.offsetWidth;
      element.style.opacity = value;
    },
    GetLinkColor: function (index) {
      if (!ASPx.IsExists(this.linkColor)) {
        var rule = ASPx.GetStyleSheetRules(this.customClassNames[index]);
        this.linkColor = rule ? rule.style.color : null;
        if (!ASPx.IsExists(this.linkColor)) {
          var rule = ASPx.GetStyleSheetRules(this.GetClassName(index));
          this.linkColor = rule ? rule.style.color : null;
        }
        if (this.linkColor == null) this.linkColor = "";
      }
      return this.linkColor;
    },
    GetLinkTextDecoration: function (index) {
      if (!ASPx.IsExists(this.linkTextDecoration)) {
        var rule = ASPx.GetStyleSheetRules(this.customClassNames[index]);
        this.linkTextDecoration = rule ? rule.style.textDecoration : null;
        if (!ASPx.IsExists(this.linkTextDecoration)) {
          var rule = ASPx.GetStyleSheetRules(this.GetClassName(index));
          this.linkTextDecoration = rule ? rule.style.textDecoration : null;
        }
        if (this.linkTextDecoration == null) this.linkTextDecoration = "";
      }
      return this.linkTextDecoration;
    },
  });
  ASPxClientStateEventArgs = ASPx.CreateClass(null, {
    constructor: function (item, element) {
      this.item = item;
      this.element = element;
      this.toElement = null;
      this.fromElement = null;
      this.htmlEvent = null;
    },
  });
  ASPxStateController = ASPx.CreateClass(null, {
    constructor: function () {
      this.focusedItems = {};
      this.hoverItems = {};
      this.pressedItems = {};
      this.selectedItems = {};
      this.disabledItems = {};
      this.disabledScheme = {};
      this.currentFocusedElement = null;
      this.currentFocusedItemName = null;
      this.currentHoverElement = null;
      this.currentHoverItemName = null;
      this.currentPressedElement = null;
      this.currentPressedItemName = null;
      this.savedCurrentPressedElement = null;
      this.savedCurrentMouseMoveSrcElement = null;
      this.AfterSetFocusedState = new ASPxClientEvent();
      this.AfterClearFocusedState = new ASPxClientEvent();
      this.AfterSetHoverState = new ASPxClientEvent();
      this.AfterClearHoverState = new ASPxClientEvent();
      this.AfterSetPressedState = new ASPxClientEvent();
      this.AfterClearPressedState = new ASPxClientEvent();
      this.AfterDisabled = new ASPxClientEvent();
      this.AfterEnabled = new ASPxClientEvent();
      this.BeforeSetFocusedState = new ASPxClientEvent();
      this.BeforeClearFocusedState = new ASPxClientEvent();
      this.BeforeSetHoverState = new ASPxClientEvent();
      this.BeforeClearHoverState = new ASPxClientEvent();
      this.BeforeSetPressedState = new ASPxClientEvent();
      this.BeforeClearPressedState = new ASPxClientEvent();
      this.BeforeDisabled = new ASPxClientEvent();
      this.BeforeEnabled = new ASPxClientEvent();
      this.FocusedItemKeyDown = new ASPxClientEvent();
    },
    AddHoverItem: function (
      name,
      classNames,
      cssTexts,
      postfixes,
      imageObjs,
      imagePostfixes,
      disableApplyingStyleToLink
    ) {
      this.AddItem(
        this.hoverItems,
        name,
        classNames,
        cssTexts,
        postfixes,
        imageObjs,
        imagePostfixes,
        ASPx.HoverItemKind,
        disableApplyingStyleToLink
      );
      this.AddItem(
        this.focusedItems,
        name,
        classNames,
        cssTexts,
        postfixes,
        imageObjs,
        imagePostfixes,
        ASPx.FocusedItemKind,
        disableApplyingStyleToLink
      );
    },
    AddPressedItem: function (
      name,
      classNames,
      cssTexts,
      postfixes,
      imageObjs,
      imagePostfixes,
      disableApplyingStyleToLink
    ) {
      this.AddItem(
        this.pressedItems,
        name,
        classNames,
        cssTexts,
        postfixes,
        imageObjs,
        imagePostfixes,
        ASPx.PressedItemKind,
        disableApplyingStyleToLink
      );
    },
    AddSelectedItem: function (
      name,
      classNames,
      cssTexts,
      postfixes,
      imageObjs,
      imagePostfixes,
      disableApplyingStyleToLink
    ) {
      this.AddItem(
        this.selectedItems,
        name,
        classNames,
        cssTexts,
        postfixes,
        imageObjs,
        imagePostfixes,
        ASPx.SelectedItemKind,
        disableApplyingStyleToLink
      );
    },
    AddDisabledItem: function (
      name,
      classNames,
      cssTexts,
      postfixes,
      imageObjs,
      imagePostfixes,
      disableApplyingStyleToLink,
      rootId
    ) {
      this.AddItem(
        this.disabledItems,
        name,
        classNames,
        cssTexts,
        postfixes,
        imageObjs,
        imagePostfixes,
        ASPx.DisabledItemKind,
        disableApplyingStyleToLink,
        this.addIdToDisabledItemScheme,
        rootId
      );
    },
    addIdToDisabledItemScheme: function (rootId, childId) {
      if (!rootId) return;
      if (!this.disabledScheme[rootId]) this.disabledScheme[rootId] = [rootId];
      if (
        childId &&
        rootId != childId &&
        ASPx.Data.ArrayIndexOf(this.disabledScheme[rootId], childId) == -1
      )
        this.disabledScheme[rootId].push(childId);
    },
    removeIdFromDisabledItemScheme: function (rootId, childId) {
      if (!rootId || !this.disabledScheme[rootId]) return;
      ASPx.Data.ArrayRemove(this.disabledScheme[rootId], childId);
      if (this.disabledScheme[rootId].length == 0)
        delete this.disabledScheme[rootId];
    },
    AddItem: function (
      items,
      name,
      classNames,
      cssTexts,
      postfixes,
      imageObjs,
      imagePostfixes,
      kind,
      disableApplyingStyleToLink,
      onAdd,
      rootId
    ) {
      var stateItem = new ASPxStateItem(
        name,
        classNames,
        cssTexts,
        postfixes,
        imageObjs,
        imagePostfixes,
        kind,
        disableApplyingStyleToLink
      );
      if (postfixes && postfixes.length > 0) {
        for (var i = 0; i < postfixes.length; i++) {
          items[name + postfixes[i]] = stateItem;
          if (onAdd) onAdd.call(this, rootId, name + postfixes[i]);
        }
      } else {
        if (onAdd) onAdd.call(this, rootId, name);
        items[name] = stateItem;
      }
      ASPx.StateItemsExist = true;
    },
    RemoveHoverItem: function (name, postfixes) {
      this.RemoveItem(this.hoverItems, name, postfixes);
      this.RemoveItem(this.focusedItems, name, postfixes);
    },
    RemovePressedItem: function (name, postfixes) {
      this.RemoveItem(this.pressedItems, name, postfixes);
    },
    RemoveSelectedItem: function (name, postfixes) {
      this.RemoveItem(this.selectedItems, name, postfixes);
    },
    RemoveDisabledItem: function (name, postfixes, rootId) {
      this.RemoveItem(
        this.disabledItems,
        name,
        postfixes,
        this.removeIdFromDisabledItemScheme,
        rootId
      );
    },
    RemoveItem: function (items, name, postfixes, onRemove, rootId) {
      if (postfixes && postfixes.length > 0) {
        for (var i = 0; i < postfixes.length; i++) {
          delete items[name + postfixes[i]];
          if (onRemove) onRemove.call(this, rootId, name + postfixes[i]);
        }
      } else {
        delete items[name];
        if (onRemove) onRemove.call(this, rootId, name);
      }
    },
    RemoveDisposedItems: function () {
      this.RemoveDisposedItemsByType(this.hoverItems);
      this.RemoveDisposedItemsByType(this.pressedItems);
      this.RemoveDisposedItemsByType(this.focusedItems);
      this.RemoveDisposedItemsByType(this.selectedItems);
      this.RemoveDisposedItemsByType(this.disabledItems);
      this.RemoveDisposedItemsByType(this.disabledScheme);
    },
    RemoveDisposedItemsByType: function (items) {
      for (var key in items) {
        var item = items[key];
        var element = document.getElementById(key);
        if (!element || !ASPx.IsValidElement(element)) delete items[key];
        try {
          if (item && item.elements) {
            for (var i = 0; i < item.elements.length; i++) {
              if (!ASPx.IsValidElements(item.links[i])) item.links[i] = null;
            }
          }
        } catch (e) {}
      }
    },
    GetFocusedElement: function (srcElement) {
      return this.GetItemElement(
        srcElement,
        this.focusedItems,
        ASPx.FocusedItemKind
      );
    },
    GetHoverElement: function (srcElement) {
      return this.GetItemElement(
        srcElement,
        this.hoverItems,
        ASPx.HoverItemKind
      );
    },
    GetPressedElement: function (srcElement) {
      return this.GetItemElement(
        srcElement,
        this.pressedItems,
        ASPx.PressedItemKind
      );
    },
    GetSelectedElement: function (srcElement) {
      return this.GetItemElement(
        srcElement,
        this.selectedItems,
        ASPx.SelectedItemKind
      );
    },
    GetDisabledElement: function (srcElement) {
      return this.GetItemElement(
        srcElement,
        this.disabledItems,
        ASPx.DisabledItemKind
      );
    },
    GetItemElement: function (srcElement, items, kind) {
      if (srcElement && srcElement[ASPx.CachedStatePrefix + kind]) {
        var cachedElement = srcElement[ASPx.CachedStatePrefix + kind];
        if (cachedElement != ASPx.EmptyObject) return cachedElement;
        return null;
      }
      var element = srcElement;
      while (element != null) {
        var item = items[element.id];
        if (item) {
          this.CacheItemElement(srcElement, kind, element);
          element[kind] = item;
          return element;
        }
        element = element.parentNode;
      }
      this.CacheItemElement(srcElement, kind, ASPx.EmptyObject);
      return null;
    },
    CacheItemElement: function (srcElement, kind, value) {
      if (srcElement && !srcElement[ASPx.CachedStatePrefix + kind])
        srcElement[ASPx.CachedStatePrefix + kind] = value;
    },
    DoSetFocusedState: function (element, fromElement) {
      var item = element[ASPx.FocusedItemKind];
      if (item) {
        var args = new ASPxClientStateEventArgs(item, element);
        args.fromElement = fromElement;
        this.BeforeSetFocusedState.FireEvent(this, args);
        item.Apply(element);
        this.AfterSetFocusedState.FireEvent(this, args);
      }
    },
    DoClearFocusedState: function (element, toElement) {
      var item = element[ASPx.FocusedItemKind];
      if (item) {
        var args = new ASPxClientStateEventArgs(item, element);
        args.toElement = toElement;
        this.BeforeClearFocusedState.FireEvent(this, args);
        item.Cancel(element);
        this.AfterClearFocusedState.FireEvent(this, args);
      }
    },
    DoSetHoverState: function (element, fromElement) {
      var item = element[ASPx.HoverItemKind];
      if (item) {
        var args = new ASPxClientStateEventArgs(item, element);
        args.fromElement = fromElement;
        this.BeforeSetHoverState.FireEvent(this, args);
        item.Apply(element);
        this.AfterSetHoverState.FireEvent(this, args);
      }
    },
    DoClearHoverState: function (element, toElement) {
      var item = element[ASPx.HoverItemKind];
      if (item) {
        var args = new ASPxClientStateEventArgs(item, element);
        args.toElement = toElement;
        this.BeforeClearHoverState.FireEvent(this, args);
        item.Cancel(element);
        this.AfterClearHoverState.FireEvent(this, args);
      }
    },
    DoSetPressedState: function (element) {
      var item = element[ASPx.PressedItemKind];
      if (item) {
        var args = new ASPxClientStateEventArgs(item, element);
        this.BeforeSetPressedState.FireEvent(this, args);
        item.Apply(element);
        this.AfterSetPressedState.FireEvent(this, args);
      }
    },
    DoClearPressedState: function (element) {
      var item = element[ASPx.PressedItemKind];
      if (item) {
        var args = new ASPxClientStateEventArgs(item, element);
        this.BeforeClearPressedState.FireEvent(this, args);
        item.Cancel(element);
        this.AfterClearPressedState.FireEvent(this, args);
      }
    },
    SetCurrentFocusedElement: function (element) {
      if (
        this.currentFocusedElement &&
        !ASPx.IsValidElement(this.currentFocusedElement)
      ) {
        this.currentFocusedElement = null;
        this.currentFocusedItemName = "";
      }
      if (this.currentFocusedElement != element) {
        var oldCurrentFocusedElement = this.currentFocusedElement;
        var item = element != null ? element[ASPx.FocusedItemKind] : null;
        var itemName = item != null ? item.name : "";
        if (this.currentFocusedItemName != itemName) {
          if (this.currentHoverItemName != "")
            this.SetCurrentHoverElement(null);
          if (this.currentFocusedElement != null)
            this.DoClearFocusedState(this.currentFocusedElement, element);
          this.currentFocusedElement = element;
          item = element != null ? element[ASPx.FocusedItemKind] : null;
          this.currentFocusedItemName = item != null ? item.name : "";
          if (this.currentFocusedElement != null)
            this.DoSetFocusedState(
              this.currentFocusedElement,
              oldCurrentFocusedElement
            );
        }
      }
    },
    SetCurrentHoverElement: function (element) {
      if (
        this.currentHoverElement &&
        !ASPx.IsValidElement(this.currentHoverElement)
      ) {
        this.currentHoverElement = null;
        this.currentHoverItemName = "";
      }
      var item = element != null ? element[ASPx.HoverItemKind] : null;
      if (item && !item.enabled) {
        element = this.GetItemElement(
          element.parentNode,
          this.hoverItems,
          ASPx.HoverItemKind
        );
        item = element != null ? element[ASPx.HoverItemKind] : null;
      }
      if (this.currentHoverElement != element) {
        var oldCurrentHoverElement = this.currentHoverElement,
          itemName = item != null ? item.name : "";
        if (
          this.currentHoverItemName != itemName ||
          (item != null && item.needRefreshBetweenElements)
        ) {
          if (this.currentHoverElement != null)
            this.DoClearHoverState(this.currentHoverElement, element);
          item = element != null ? element[ASPx.HoverItemKind] : null;
          if (item == null || item.enabled) {
            this.currentHoverElement = element;
            this.currentHoverItemName = item != null ? item.name : "";
            if (this.currentHoverElement != null)
              this.DoSetHoverState(
                this.currentHoverElement,
                oldCurrentHoverElement
              );
          }
        }
      }
    },
    SetCurrentPressedElement: function (element) {
      if (
        this.currentPressedElement &&
        !ASPx.IsValidElement(this.currentPressedElement)
      ) {
        this.currentPressedElement = null;
        this.currentPressedItemName = "";
      }
      if (this.currentPressedElement != element) {
        if (this.currentPressedElement != null)
          this.DoClearPressedState(this.currentPressedElement);
        var item = element != null ? element[ASPx.PressedItemKind] : null;
        if (item == null || item.enabled) {
          this.currentPressedElement = element;
          this.currentPressedItemName = item != null ? item.name : "";
          if (this.currentPressedElement != null)
            this.DoSetPressedState(this.currentPressedElement);
        }
      }
    },
    SetCurrentFocusedElementBySrcElement: function (srcElement) {
      var element = this.GetFocusedElement(srcElement);
      this.SetCurrentFocusedElement(element);
    },
    SetCurrentHoverElementBySrcElement: function (srcElement) {
      var element = this.GetHoverElement(srcElement);
      this.SetCurrentHoverElement(element);
    },
    SetCurrentPressedElementBySrcElement: function (srcElement) {
      var element = this.GetPressedElement(srcElement);
      this.SetCurrentPressedElement(element);
    },
    SetPressedElement: function (element) {
      this.SetCurrentHoverElement(null);
      this.SetCurrentPressedElementBySrcElement(element);
      this.savedCurrentPressedElement = this.currentPressedElement;
    },
    SelectElement: function (element) {
      var item = element[ASPx.SelectedItemKind];
      if (item) item.Apply(element);
    },
    SelectElementBySrcElement: function (srcElement) {
      var element = this.GetSelectedElement(srcElement);
      if (element != null) this.SelectElement(element);
    },
    DeselectElement: function (element) {
      var item = element[ASPx.SelectedItemKind];
      if (item) item.Cancel(element);
    },
    DeselectElementBySrcElement: function (srcElement) {
      var element = this.GetSelectedElement(srcElement);
      if (element != null) this.DeselectElement(element);
    },
    SetElementEnabled: function (element, enable) {
      if (enable) this.EnableElement(element);
      else this.DisableElement(element);
    },
    SetElementWithChildNodesEnabled: function (parentName, enabled) {
      var procFunct = enabled ? this.EnableElement : this.DisableElement;
      var childItems = this.disabledScheme[parentName];
      if (childItems && childItems.length > 0)
        for (var i = 0; i < childItems.length; i++) {
          procFunct.call(this, document.getElementById(childItems[i]));
        }
    },
    DisableElement: function (element) {
      var element = this.GetDisabledElement(element);
      if (element != null) {
        var item = element[ASPx.DisabledItemKind];
        if (item) {
          var args = new ASPxClientStateEventArgs(item, element);
          this.BeforeDisabled.FireEvent(this, args);
          if (item.name == this.currentPressedItemName)
            this.SetCurrentPressedElement(null);
          if (item.name == this.currentHoverItemName)
            this.SetCurrentHoverElement(null);
          item.Apply(element);
          this.SetMouseStateItemsEnabled(item.name, item.postfixes, false);
          this.AfterDisabled.FireEvent(this, args);
        }
      }
    },
    EnableElement: function (element) {
      var element = this.GetDisabledElement(element);
      if (element != null) {
        var item = element[ASPx.DisabledItemKind];
        if (item) {
          var args = new ASPxClientStateEventArgs(item, element);
          this.BeforeEnabled.FireEvent(this, args);
          item.Cancel(element);
          this.SetMouseStateItemsEnabled(item.name, item.postfixes, true);
          this.AfterEnabled.FireEvent(this, args);
        }
      }
    },
    SetMouseStateItemsEnabled: function (name, postfixes, enabled) {
      if (postfixes && postfixes.length > 0) {
        for (var i = 0; i < postfixes.length; i++) {
          this.SetItemsEnabled(this.hoverItems, name + postfixes[i], enabled);
          this.SetItemsEnabled(this.pressedItems, name + postfixes[i], enabled);
          this.SetItemsEnabled(this.focusedItems, name + postfixes[i], enabled);
        }
      } else {
        this.SetItemsEnabled(this.hoverItems, name, enabled);
        this.SetItemsEnabled(this.pressedItems, name, enabled);
        this.SetItemsEnabled(this.focusedItems, name, enabled);
      }
    },
    SetItemsEnabled: function (items, name, enabled) {
      if (items[name]) items[name].enabled = enabled;
    },
    OnFocusMove: function (evt) {
      var element = ASPx.Evt.GetEventSource(evt);
      aspxGetStateController().SetCurrentFocusedElementBySrcElement(element);
    },
    OnMouseMove: function (evt, checkElementChanged) {
      var srcElement = ASPx.Evt.GetEventSource(evt);
      if (
        checkElementChanged &&
        srcElement == this.savedCurrentMouseMoveSrcElement
      )
        return;
      this.savedCurrentMouseMoveSrcElement = srcElement;
      if (
        ASPx.Browser.IE &&
        !ASPx.Evt.IsLeftButtonPressed(evt) &&
        this.savedCurrentPressedElement != null
      )
        this.ClearSavedCurrentPressedElement();
      if (this.savedCurrentPressedElement == null)
        this.SetCurrentHoverElementBySrcElement(srcElement);
      else {
        var element = this.GetPressedElement(srcElement);
        if (element != this.currentPressedElement) {
          if (element == this.savedCurrentPressedElement)
            this.SetCurrentPressedElement(this.savedCurrentPressedElement);
          else this.SetCurrentPressedElement(null);
        }
      }
    },
    OnMouseDown: function (evt) {
      if (!ASPx.Evt.IsLeftButtonPressed(evt)) return;
      var srcElement = ASPx.Evt.GetEventSource(evt);
      this.OnMouseDownOnElement(srcElement);
    },
    OnMouseDownOnElement: function (element) {
      if (this.GetPressedElement(element) == null) return;
      this.SetPressedElement(element);
    },
    OnMouseUp: function (evt) {
      var srcElement = ASPx.Evt.GetEventSource(evt);
      this.OnMouseUpOnElement(srcElement);
    },
    OnMouseUpOnElement: function (element) {
      if (this.savedCurrentPressedElement == null) return;
      this.ClearSavedCurrentPressedElement();
      this.SetCurrentHoverElementBySrcElement(element);
    },
    OnMouseOver: function (evt) {
      var element = ASPx.Evt.GetEventSource(evt);
      if (element && element.tagName == "IFRAME") this.OnMouseMove(evt, true);
    },
    OnKeyDown: function (evt) {
      var element = this.GetFocusedElement(ASPx.Evt.GetEventSource(evt));
      if (element != null && element == this.currentFocusedElement) {
        var item = element[ASPx.FocusedItemKind];
        if (item) {
          var args = new ASPxClientStateEventArgs(item, element);
          args.htmlEvent = evt;
          this.FocusedItemKeyDown.FireEvent(this, args);
        }
      }
    },
    OnSelectStart: function (evt) {
      if (this.savedCurrentPressedElement) {
        ASPx.Selection.Clear();
        return false;
      }
    },
    ClearSavedCurrentPressedElement: function () {
      this.savedCurrentPressedElement = null;
      this.SetCurrentPressedElement(null);
    },
    ClearCache: function (srcElement, kind) {
      if (srcElement[ASPx.CachedStatePrefix + kind])
        srcElement[ASPx.CachedStatePrefix + kind] = null;
    },
    ClearElementCache: function (srcElement) {
      this.ClearCache(srcElement, ASPx.FocusedItemKind);
      this.ClearCache(srcElement, ASPx.HoverItemKind);
      this.ClearCache(srcElement, ASPx.PressedItemKind);
      this.ClearCache(srcElement, ASPx.SelectedItemKind);
      this.ClearCache(srcElement, ASPx.DisabledItemKind);
    },
  });
  var stateController = null;
  function aspxGetStateController() {
    if (stateController == null) stateController = new ASPxStateController();
    return stateController;
  }
  function aspxAddStateItems(
    method,
    namePrefix,
    classes,
    disableApplyingStyleToLink
  ) {
    for (var i = 0; i < classes.length; i++) {
      for (var j = 0; j < classes[i][2].length; j++) {
        var name = namePrefix;
        if (classes[i][2][j]) name += "_" + classes[i][2][j];
        var postfixes = classes[i][3] || null;
        var imageObjs = (classes[i][4] && classes[i][4][j]) || null;
        var imagePostfixes = classes[i][5] || null;
        method.call(
          aspxGetStateController(),
          name,
          classes[i][0],
          classes[i][1],
          postfixes,
          imageObjs,
          imagePostfixes,
          disableApplyingStyleToLink,
          namePrefix
        );
      }
    }
  }
  ASPx.AddHoverItems = function (
    namePrefix,
    classes,
    disableApplyingStyleToLink
  ) {
    aspxAddStateItems(
      aspxGetStateController().AddHoverItem,
      namePrefix,
      classes,
      disableApplyingStyleToLink
    );
  };
  ASPx.AddPressedItems = function (
    namePrefix,
    classes,
    disableApplyingStyleToLink
  ) {
    aspxAddStateItems(
      aspxGetStateController().AddPressedItem,
      namePrefix,
      classes,
      disableApplyingStyleToLink
    );
  };
  ASPx.AddSelectedItems = function (
    namePrefix,
    classes,
    disableApplyingStyleToLink
  ) {
    aspxAddStateItems(
      aspxGetStateController().AddSelectedItem,
      namePrefix,
      classes,
      disableApplyingStyleToLink
    );
  };
  ASPx.AddDisabledItems = function (
    namePrefix,
    classes,
    disableApplyingStyleToLink
  ) {
    aspxAddStateItems(
      aspxGetStateController().AddDisabledItem,
      namePrefix,
      classes,
      disableApplyingStyleToLink
    );
  };
  function aspxRemoveStateItems(method, namePrefix, classes) {
    for (var i = 0; i < classes.length; i++) {
      for (var j = 0; j < classes[i][0].length; j++) {
        var name = namePrefix;
        if (classes[i][0][j]) name += "_" + classes[i][0][j];
        method.call(aspxGetStateController(), name, classes[i][1], namePrefix);
      }
    }
  }
  ASPx.RemoveHoverItems = function (namePrefix, classes) {
    aspxRemoveStateItems(
      aspxGetStateController().RemoveHoverItem,
      namePrefix,
      classes
    );
  };
  ASPx.RemovePressedItems = function (namePrefix, classes) {
    aspxRemoveStateItems(
      aspxGetStateController().RemovePressedItem,
      namePrefix,
      classes
    );
  };
  ASPx.RemoveSelectedItems = function (namePrefix, classes) {
    aspxRemoveStateItems(
      aspxGetStateController().RemoveSelectedItem,
      namePrefix,
      classes
    );
  };
  ASPx.RemoveDisabledItems = function (namePrefix, classes) {
    aspxRemoveStateItems(
      aspxGetStateController().RemoveDisabledItem,
      namePrefix,
      classes
    );
  };
  ASPx.AddAfterClearFocusedState = function (handler) {
    aspxGetStateController().AfterClearFocusedState.AddHandler(handler);
  };
  ASPx.AddAfterSetFocusedState = function (handler) {
    aspxGetStateController().AfterSetFocusedState.AddHandler(handler);
  };
  ASPx.AddAfterClearHoverState = function (handler) {
    aspxGetStateController().AfterClearHoverState.AddHandler(handler);
  };
  ASPx.AddAfterSetHoverState = function (handler) {
    aspxGetStateController().AfterSetHoverState.AddHandler(handler);
  };
  ASPx.AddAfterClearPressedState = function (handler) {
    aspxGetStateController().AfterClearPressedState.AddHandler(handler);
  };
  ASPx.AddAfterSetPressedState = function (handler) {
    aspxGetStateController().AfterSetPressedState.AddHandler(handler);
  };
  ASPx.AddAfterDisabled = function (handler) {
    aspxGetStateController().AfterDisabled.AddHandler(handler);
  };
  ASPx.AddAfterEnabled = function (handler) {
    aspxGetStateController().AfterEnabled.AddHandler(handler);
  };
  ASPx.AddBeforeClearFocusedState = function (handler) {
    aspxGetStateController().BeforeClearFocusedState.AddHandler(handler);
  };
  ASPx.AddBeforeSetFocusedState = function (handler) {
    aspxGetStateController().BeforeSetFocusedState.AddHandler(handler);
  };
  ASPx.AddBeforeClearHoverState = function (handler) {
    aspxGetStateController().BeforeClearHoverState.AddHandler(handler);
  };
  ASPx.AddBeforeSetHoverState = function (handler) {
    aspxGetStateController().BeforeSetHoverState.AddHandler(handler);
  };
  ASPx.AddBeforeClearPressedState = function (handler) {
    aspxGetStateController().BeforeClearPressedState.AddHandler(handler);
  };
  ASPx.AddBeforeSetPressedState = function (handler) {
    aspxGetStateController().BeforeSetPressedState.AddHandler(handler);
  };
  ASPx.AddBeforeDisabled = function (handler) {
    aspxGetStateController().BeforeDisabled.AddHandler(handler);
  };
  ASPx.AddBeforeEnabled = function (handler) {
    aspxGetStateController().BeforeEnabled.AddHandler(handler);
  };
  ASPx.AddFocusedItemKeyDown = function (handler) {
    aspxGetStateController().FocusedItemKeyDown.AddHandler(handler);
  };
  ASPx.SetHoverState = function (element) {
    aspxGetStateController().SetCurrentHoverElementBySrcElement(element);
  };
  ASPx.ClearHoverState = function (evt) {
    aspxGetStateController().SetCurrentHoverElementBySrcElement(null);
  };
  ASPx.UpdateHoverState = function (evt) {
    aspxGetStateController().OnMouseMove(evt, false);
  };
  ASPx.SetFocusedState = function (element) {
    aspxGetStateController().SetCurrentFocusedElementBySrcElement(element);
  };
  ASPx.ClearFocusedState = function (evt) {
    aspxGetStateController().SetCurrentFocusedElementBySrcElement(null);
  };
  ASPx.UpdateFocusedState = function (evt) {
    aspxGetStateController().OnFocusMove(evt);
  };
  ASPx.AccessibilityMarkerClass = "dxalink";
  ASPx.AssignAccessabilityEventsToChildrenLinks = function (container) {
    var links = ASPx.GetNodesByPartialClassName(
      container,
      ASPx.AccessibilityMarkerClass
    );
    for (var i = 0; i < links.length; i++)
      ASPx.AssignAccessabilityEventsToLink(links[i]);
  };
  ASPx.AssignAccessabilityEventsToLink = function (link) {
    if (!ASPx.ElementContainsCssClass(link, ASPx.AccessibilityMarkerClass))
      return;
    ASPx.Evt.AttachEventToElement(link, "focus", function (e) {
      ASPx.UpdateFocusedState(e);
    });
    ASPx.Evt.AttachEventToElement(link, "blur", function (e) {
      ASPx.ClearFocusedState(e);
    });
  };
  ASPx.Evt.AttachEventToDocument("mousemove", function (evt) {
    if (ASPx.classesScriptParsed && ASPx.StateItemsExist)
      aspxGetStateController().OnMouseMove(evt, true);
  });
  ASPx.Evt.AttachEventToDocument(
    ASPx.TouchUIHelper.touchMouseDownEventName,
    function (evt) {
      if (ASPx.classesScriptParsed && ASPx.StateItemsExist)
        aspxGetStateController().OnMouseDown(evt);
    }
  );
  ASPx.Evt.AttachEventToDocument(
    ASPx.TouchUIHelper.touchMouseUpEventName,
    function (evt) {
      if (ASPx.classesScriptParsed && ASPx.StateItemsExist)
        aspxGetStateController().OnMouseUp(evt);
    }
  );
  ASPx.Evt.AttachEventToDocument("mouseover", function (evt) {
    if (ASPx.classesScriptParsed && ASPx.StateItemsExist)
      aspxGetStateController().OnMouseOver(evt);
  });
  ASPx.Evt.AttachEventToDocument("keydown", function (evt) {
    if (ASPx.classesScriptParsed && ASPx.StateItemsExist)
      aspxGetStateController().OnKeyDown(evt);
  });
  ASPx.Evt.AttachEventToDocument("selectstart", function (evt) {
    if (ASPx.classesScriptParsed && ASPx.StateItemsExist)
      return aspxGetStateController().OnSelectStart(evt);
  });
  ASPx.GetStateController = aspxGetStateController;
})();
(function () {
  if (typeof ASPx == "undefined") {
    window.ASPx = {};
  }
  ASPx.ASPxImageLoad = {};
  ASPx.ASPxImageLoad.dxDefaultLoadingImageCssClass = "dxe-loadingImage";
  ASPx.ASPxImageLoad.OnLoad = function (
    image,
    customLoadingImage,
    isOldIE,
    customBackgroundImageUrl
  ) {
    image.dxCustomBackgroundImageUrl = "";
    image.dxShowLoadingImage = true;
    image.dxCustomLoadingImage = customLoadingImage;
    if (customBackgroundImageUrl != "")
      image.dxCustomBackgroundImageUrl =
        "url('" + customBackgroundImageUrl + "')";
    ASPx.ASPxImageLoad.prepareImageBackground(image, isOldIE);
    ASPx.ASPxImageLoad.removeHandlers(image);
    image.className = image.className.replace(
      ASPx.ASPxImageLoad.dxDefaultLoadingImageCssClass,
      ""
    );
  };
  ASPx.ASPxImageLoad.removeASPxImageBackground = function (image, isOldIE) {
    if (isOldIE) image.style.removeAttribute("background-image");
    else image.style.backgroundImage = "";
  };
  ASPx.ASPxImageLoad.prepareImageBackground = function (image, isOldIE) {
    ASPx.ASPxImageLoad.removeASPxImageBackground(image, isOldIE);
    if (image.dxCustomBackgroundImageUrl != "")
      image.style.backgroundImage = image.dxCustomBackgroundImageUrl;
  };
  ASPx.ASPxImageLoad.removeHandlers = function (image) {
    image.removeAttribute("onload");
    image.removeAttribute("onabort");
    image.removeAttribute("onerror");
  };
})();
(function () {
  var ASPxClientHiddenField = ASPx.CreateClass(ASPxClientControl, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.syncWithServer = true;
      this.properties = {};
      this.typeInfoTable = {};
      this.typeNameTable = [];
    },
    IsDOMDisposed: function () {
      return this.syncWithServer
        ? !ASPx.IsExistsElement(this.GetStateHiddenField())
        : false;
    },
    UpdateStateObject: function () {
      if (!this.syncWithServer) return;
      var serializedData = ASPx.GetHiddenFieldSerializer().Serialize(this);
      this.UpdateStateObjectWithObject({ data: serializedData });
    },
    GetStateHiddenField: function () {
      return ASPx.GetElementById(this.uniqueID);
    },
    EscapeSpecialCharacters: function (str) {
      str = str.replace(/\\/g, "\\\\");
      var specialChars = {};
      for (var i = 0; i < str.length; i++) {
        var char = str.charAt(i);
        var charCode = char.charCodeAt(0);
        if (charCode < 32) {
          var hexCharCode = charCode.toString(16);
          specialChars[char] =
            "\\u" + "0000".substr(0, 4 - hexCharCode.length) + hexCharCode;
        }
      }
      for (var ch in specialChars)
        str = str.replace(new RegExp(ch, "g"), specialChars[ch]);
      return str;
    },
    PerformCallback: function (parameter) {
      this.CreateCallback(parameter);
    },
    OnCallback: function (result) {
      var callbackMarkupContainer = this.GetCallbackMarkupContainer();
      ASPx.SetInnerHtml(callbackMarkupContainer, result);
    },
    GetCallbackMarkupContainer: function () {
      var callbackMarkupContainer = ASPx.GetElementById(
        this.GetCallbackMarkupContainerID()
      );
      if (!callbackMarkupContainer) {
        callbackMarkupContainer = this.CreateCallbackMarkupContainer();
        document.body.appendChild(callbackMarkupContainer);
      }
      return callbackMarkupContainer;
    },
    GetCallbackMarkupContainerID: function () {
      return this.name + ASPxClientHiddenField.CallbackMarkupContainerIDSuffix;
    },
    CreateCallbackMarkupContainer: function () {
      var callbackMarkupContainer = document.createElement("DIV");
      ASPx.SetElementDisplay(callbackMarkupContainer, false);
      callbackMarkupContainer.id = this.GetCallbackMarkupContainerID();
      return callbackMarkupContainer;
    },
    Add: function (propertyName, propertyValue) {
      var existentPropertyValue = this.Get(propertyName);
      if (typeof existentPropertyValue == "undefined")
        this.Set(propertyName, propertyValue);
      else
        alert(
          "A property with the name '" +
            propertyName +
            "' has already been added."
        );
    },
    Get: function (propertyName) {
      var safeName = this.GetTopLevelPropertySafeName(propertyName);
      return this.properties[safeName];
    },
    Set: function (propertyName, propertyValue) {
      var safeName = this.GetTopLevelPropertySafeName(propertyName);
      if (typeof propertyValue == "undefined") this.Remove(propertyName);
      else this.properties[safeName] = propertyValue;
    },
    Remove: function (propertyName) {
      var safeName = this.GetTopLevelPropertySafeName(propertyName);
      delete this.properties[safeName];
      TypeInfoHelper.RemoveTypeInfoBranch(this.typeInfoTable, safeName);
    },
    Clear: function () {
      this.properties = {};
      this.typeInfoTable = {};
      this.typeNameTable = [];
    },
    Contains: function (propertyName) {
      var safeTopLevelPropertyName =
        this.GetTopLevelPropertySafeName(propertyName);
      for (var key in this.properties) {
        if (key == safeTopLevelPropertyName) return true;
      }
      return false;
    },
    GetTopLevelPropertySafeName: function (propertyName) {
      return ASPxClientHiddenField.TopLevelKeyPrefix + propertyName;
    },
  });
  ASPxClientHiddenField.Cast = ASPxClientControl.Cast;
  ASPxClientHiddenField.InputElementIDSuffix = "_I";
  ASPxClientHiddenField.CallbackMarkupContainerIDSuffix = "_D";
  ASPxClientHiddenField.TopLevelKeyPrefix = "dxp";
  var TypeInfoHelper = ASPx.CreateClass(null, {
    constructor: function () {
      this.minUnknownTypeIndex = 1024;
      this.clientTypeConstructors = [
        null,
        Number,
        String,
        Date,
        Boolean,
        RegExp,
        Array,
        Object,
        Function,
      ];
      this.clientTypeConstructorIndices = {};
      for (var i = 1; i < this.clientTypeConstructors.length; i++)
        this.clientTypeConstructorIndices[this.clientTypeConstructors[i]] = i;
    },
    EnsureTypeInfoTableCompliant: function (value, typeInfoTable, typeInfoKey) {
      if (typeInfoKey == "") return;
      var typeCode = typeInfoTable[typeInfoKey];
      if (typeof typeCode == "undefined")
        typeCode = this.GetArrayItemTypeCode(typeInfoTable, typeInfoKey);
      if (typeof typeCode != "undefined") {
        if (!this.IsValueTypeInfoCompliant(value, typeCode))
          TypeInfoHelper.RemoveTypeInfoBranch(typeInfoTable, typeInfoKey);
        else return;
      }
      typeCode = this.CreateTypeCode(value);
      if (typeof typeCode != "undefined") typeInfoTable[typeInfoKey] = typeCode;
      else delete typeInfoTable[typeInfoKey];
    },
    GetArrayItemTypeCode: function (typeInfoTable, typeInfoKey) {
      var separator = "|";
      var index = typeInfoKey.lastIndexOf(separator);
      if (index < 0) return;
      itemTypeKey = typeInfoKey.substr(0, index) + "_itemType";
      var typeCode = typeInfoTable[itemTypeKey];
      if (typeof typeCode != "undefined") typeInfoTable[typeInfoKey] = typeCode;
      return typeCode;
    },
    IsAtomValue: function (value, typeCode) {
      return (
        typeCode == 0 ||
        !(
          this.IsListValue(value, typeCode) ||
          this.IsDictionaryValue(value, typeCode)
        )
      );
    },
    IsListValue: function (value, typeCode) {
      return this.IsKnownTypeCode(typeCode)
        ? this.GetConstructor(typeCode) === Array
        : value.constructor === Array;
    },
    IsDictionaryValue: function (value, typeCode) {
      return this.IsKnownTypeCode(typeCode)
        ? this.GetConstructor(typeCode) === Object
        : value.constructor === Object;
    },
    GetArrayTypeCode: function () {
      return this.clientTypeConstructorIndices[Array] << 1;
    },
    GetStringTypeCode: function () {
      return this.clientTypeConstructorIndices[String] << 1;
    },
    IsStringTypeCode: function (typeCode) {
      return typeCode == this.GetStringTypeCode();
    },
    IsValueTypeInfoCompliant: function (value, typeCode) {
      if (this.IsKnownTypeCode(typeCode))
        return value != null
          ? value.constructor === this.GetConstructor(typeCode)
          : this.IsNullable(typeCode);
      else
        return (
          value == null ||
          value.constructor === Array ||
          value.constructor === Object
        );
    },
    CreateTypeCode: function (value) {
      if (value == null) return 1;
      var clientTypeIndex =
        this.clientTypeConstructorIndices[value.constructor];
      var lowerBit = Number(
        clientTypeIndex == this.clientTypeConstructorIndices[RegExp] ||
          clientTypeIndex == this.clientTypeConstructorIndices[Array] ||
          clientTypeIndex == this.clientTypeConstructorIndices[Object]
      );
      return typeof clientTypeIndex != "undefined"
        ? (clientTypeIndex << 1) + lowerBit
        : void 0;
    },
    IsNullable: function (typeCode) {
      return (typeCode & 1) > 0;
    },
    GetConstructor: function (typeCode) {
      return this.clientTypeConstructors[(typeCode >>> 1) & 7];
    },
    IsKnownTypeCode: function (typeCode) {
      return typeCode < this.minUnknownTypeIndex;
    },
  });
  TypeInfoHelper.RemoveTypeInfoBranch = function (
    typeInfoTable,
    typeInfoKeyPrefix
  ) {
    for (var key in typeInfoTable) {
      if (key.indexOf(typeInfoKeyPrefix) == 0) delete typeInfoTable[key];
    }
  };
  var HiddenFieldSerializer = ASPx.CreateClass(null, {
    constructor: function () {
      this.typeInfoHelper = new TypeInfoHelper();
      this.separator = "|";
      this.sentinel = "#";
      this.charCodes = this.CreateCharCodeList(["a", "z", "0", "9", "_", "$"]);
    },
    Serialize: function (hiddenField) {
      var sb = [];
      this.SerializeCore(
        hiddenField.typeNameTable,
        "",
        sb,
        null,
        null,
        null,
        false
      );
      this.SerializeCore(
        hiddenField.properties,
        "",
        sb,
        hiddenField.typeInfoTable,
        hiddenField.typeNameTable,
        ASPxClientHiddenField.TopLevelKeyPrefix,
        true
      );
      return sb.join("");
    },
    SerializeCore: function (
      value,
      pathInPropertiesTree,
      serializedData,
      typeInfoTable,
      typeNameTable,
      keyNamePrefix,
      validateKeys
    ) {
      var metaTablesDefined = typeInfoTable != null && typeNameTable != null;
      var typeCode = null;
      if (metaTablesDefined) {
        this.typeInfoHelper.EnsureTypeInfoTableCompliant(
          value,
          typeInfoTable,
          pathInPropertiesTree
        );
        typeCode = typeInfoTable[pathInPropertiesTree];
      } else {
        typeCode =
          value.constructor === Array
            ? this.typeInfoHelper.GetArrayTypeCode()
            : this.typeInfoHelper.GetStringTypeCode();
      }
      if (typeof typeCode != "undefined") serializedData.push(typeCode);
      serializedData.push(this.separator);
      if (
        typeof typeCode == "undefined" ||
        this.typeInfoHelper.IsDictionaryValue(value, typeCode)
      ) {
        for (var key in value) {
          var serializableKey = key;
          if (keyNamePrefix.length > 0)
            serializableKey = serializableKey.slice(keyNamePrefix.length);
          if (validateKeys) this.AssertKeyIsValid(serializableKey);
          serializedData.push(serializableKey);
          serializedData.push(this.separator);
          this.SerializeCore(
            value[key],
            pathInPropertiesTree.length > 0
              ? pathInPropertiesTree + this.separator + key
              : key,
            serializedData,
            typeInfoTable,
            typeNameTable,
            "",
            validateKeys
          );
        }
        serializedData.push(this.sentinel);
      } else if (this.typeInfoHelper.IsListValue(value, typeCode)) {
        for (var i = 0; i < value.length; i++)
          this.SerializeCore(
            value[i],
            pathInPropertiesTree.length > 0
              ? pathInPropertiesTree + this.separator + i
              : i,
            serializedData,
            typeInfoTable,
            typeNameTable,
            "",
            validateKeys
          );
        serializedData.push(this.sentinel);
      } else if (this.typeInfoHelper.IsAtomValue(value, typeCode))
        this.SerializeAtomValue(value, serializedData, typeCode);
    },
    SerializeAtomValue: function (value, sb, typeCode) {
      var valueStr = this.SerializeAtomValueCore(value, typeCode);
      sb.push(valueStr.length.toString());
      sb.push(this.separator);
      sb.push(valueStr);
    },
    SerializeAtomValueCore: function (value, typeCode) {
      var isString = this.typeInfoHelper.IsStringTypeCode(typeCode);
      if (value == null) return isString ? "0" : "";
      else {
        if (isString) {
          return "1" + value.replace(/\r/g, "");
        } else {
          var ctor = value.constructor;
          if (ctor === String) return value;
          else if (ctor === Boolean) return value ? "1" : "0";
          else if (ctor === Number) return value.toString();
          else if (ctor === Date)
            return String(ASPx.DateUtils.ToLocalTime(value).valueOf());
          else if (ctor === RegExp) {
            var options = "";
            if (value.ignoreCase) options += "i";
            if (value.multiline) options += "m";
            return options + "," + value.source;
          }
        }
      }
      alert(
        "Unable to serialize value " +
          value.toString() +
          " (Constructor: " +
          value.constructor.toString() +
          ")."
      );
    },
    AssertKeyIsValid: function (key) {
      if (!key) alert("Empty key.");
    },
    CreateCharCodeList: function (chars) {
      var charCodes = {};
      for (var i = 0; i < chars.length; i++) {
        var ch = chars[i];
        charCodes[ch] = ch.charCodeAt(0);
      }
      return charCodes;
    },
    IsLowercaseLetterCharCode: function (charCode) {
      return charCode >= this.charCodes["a"] && charCode <= this.charCodes["z"];
    },
  });
  var hiddenFieldSerializer;
  ASPx.GetHiddenFieldSerializer = function () {
    if (!hiddenFieldSerializer)
      hiddenFieldSerializer = new HiddenFieldSerializer();
    return hiddenFieldSerializer;
  };
  ASPx.TypeInfoHelper = TypeInfoHelper;
  window.ASPxClientHiddenField = ASPxClientHiddenField;
})();

(function () {
  ASPxClientPanelBase = ASPx.CreateClass(ASPxClientControl, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.touchUIScroller = null;
    },
    Initialize: function () {
      ASPxClientControl.prototype.Initialize.call(this);
      this.touchUIScroller = ASPx.TouchUIHelper.makeScrollableIfRequired(
        this.GetMainElement()
      );
    },
    getContentElement: function () {
      if (this.getAnimationContentContainerElement())
        return this.getAnimationContentContainerElement();
      if (this.getScrollContentContainerElement())
        return this.getScrollContentContainerElement();
      if (!ASPx.IsExistsElement(this.contentElement)) {
        var element = this.GetMainElement();
        this.contentElement =
          element && element.tagName == "TABLE"
            ? element.rows[0].cells[0]
            : element;
      }
      return this.contentElement;
    },
    getAnimationContentContainerElement: function () {
      return null;
    },
    getScrollContentContainerElement: function () {
      return null;
    },
    GetContentHTML: function () {
      return this.GetContentHtml();
    },
    SetContentHTML: function (html) {
      this.SetContentHtml(html);
    },
    GetContentHtml: function () {
      return this.getContentElement().innerHTML;
    },
    SetContentHtml: function (html) {
      ASPx.SetInnerHtml(this.getContentElement(), html);
      if (this.touchUIScroller)
        this.touchUIScroller.ChangeElement(this.getContentElement());
    },
  });
  ASPxClientPanelBase.Cast = ASPxClientControl.Cast;
  var FixedPanels = {};
  var FixedPositionProperties;
  var InitFixedPositionProperties = function () {
    FixedPositionProperties = {};
    FixedPositionProperties["Top"] = {
      documentPadding: "padding-top",
      documentMargin: "margin-top",
      documentMargin2: "margin-bottom",
      contentEdge: "top",
      oppositeContentEdge: "bottom",
      size: "offsetHeight",
      animationSize: "height",
      oppositePanel: "Bottom",
    };
    FixedPositionProperties["Bottom"] = {
      documentPadding: "padding-bottom",
      documentMargin: "margin-top",
      documentMargin2: "margin-bottom",
      contentEdge: "bottom",
      oppositeContentEdge: "top",
      size: "offsetHeight",
      animationSize: "height",
      oppositePanel: "Top",
    };
    FixedPositionProperties["Left"] = {
      documentPadding: "padding-left",
      documentMargin: "margin-left",
      documentMargin2: "margin-right",
      contentEdge: "left",
      oppositeContentEdge: "right",
      size: "offsetWidth",
      animationSize: "width",
      oppositePanel: "Right",
    };
    FixedPositionProperties["Right"] = {
      documentPadding: "padding-right",
      documentMargin: "margin-left",
      documentMargin2: "margin-right",
      contentEdge: "right",
      oppositeContentEdge: "left",
      size: "offsetWidth",
      animationSize: "width",
      oppositePanel: "Left",
    };
  };
  var ExpandDirectionProperties;
  var InitExpandDirectionProperties = function () {
    ExpandDirectionProperties = {};
    ExpandDirectionProperties["PopupToLeft"] = {
      hAlign: ASPx.PopupUtils.OutsideLeftAlignIndicator,
      vAlign: ASPx.PopupUtils.TopSidesAlignIndicator,
      size: "offsetWidth",
      animationSize: "width",
    };
    ExpandDirectionProperties["PopupToRight"] = {
      hAlign: ASPx.PopupUtils.OutsideRightAlignIndicator,
      vAlign: ASPx.PopupUtils.TopSidesAlignIndicator,
      size: "offsetWidth",
      animationSize: "width",
    };
    ExpandDirectionProperties["PopupToTop"] = {
      hAlign: ASPx.PopupUtils.LeftSidesAlignIndicator,
      vAlign: ASPx.PopupUtils.AboveAlignIndicator,
      size: "offsetHeight",
      animationSize: "height",
    };
    ExpandDirectionProperties["PopupToBottom"] = {
      hAlign: ASPx.PopupUtils.LeftSidesAlignIndicator,
      vAlign: ASPx.PopupUtils.BelowAlignIndicator,
      size: "offsetHeight",
      animationSize: "height",
    };
  };
  var CollapsiblePanelsAutoGenGroupCount = 0;
  var CollapsiblePanelsGroups = {};
  var ExpandedPanels = {};
  var DocumentProperties = {};
  var EXPANDED_SELECTOR = "dxpnl-expanded";
  var COLLAPSIBLE_SELECTOR = "dxpnl-collapsible";
  var CENTER_BTN_POSITION_SELECTOR = "dxpnl-cp";
  var EXPAND_BAR_ID = "_EB";
  var EXPAND_BUTTON_ID = "_EBB";
  var CONTENT_CONTAINER_ID = "_CC";
  var COLLAPSED_STATE_CLASS_NAME = "dxpnl-collapsedState";
  var HIDDEN_STATE_CLASS_NAME = "dxpnl-hiddenState";
  ASPxClientPanel = ASPx.CreateClass(ASPxClientPanelBase, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.animationType = "none";
      this.fixedPosition = this.getFixedPosition();
      this.expandEffect = "Slide";
      this.expandOnPageLoad = false;
      this.groupName = "";
      this.fixedPositionOverlap = false;
      this.fixedPositionProperties = null;
      this.expandDirectionProperties = null;
      this.documentMarginsChanged = false;
      this.slideAnimationPosProperty = null;
      this.slideAnimationExpandBarSize = null;
      this.collapseWindowWidth = 0;
      this.collapseWindowHeight = 0;
      this.hideWindowWidth = 0;
      this.hideWindowHeight = 0;
      this.contentElement = null;
      this.expandBarElement = null;
      this.expandButtonElement = null;
      this.animationContentContainerElement = null;
      this.scrollContentContainerElement = null;
      this.Collapsed = new ASPxClientEvent();
      this.Expanded = new ASPxClientEvent();
    },
    InlineInitialize: function () {
      ASPxClientPanelBase.prototype.InlineInitialize.call(this);
      if (this.fixedPosition) {
        if (!FixedPositionProperties) InitFixedPositionProperties();
        this.fixedPositionProperties =
          FixedPositionProperties[this.fixedPosition];
      }
      if (this.expandEffect.indexOf("Popup") > -1) {
        if (!ExpandDirectionProperties) InitExpandDirectionProperties();
        this.expandDirectionProperties =
          ExpandDirectionProperties[this.expandEffect];
      }
      if (this.isPositionFixed()) {
        FixedPanels[this.fixedPosition] = this;
        var scrollContainer = this.getScrollContentContainerElement();
        if (
          scrollContainer &&
          ((scrollContainer.style.overflow !== "" &&
            scrollContainer.style.overflow !== "visible") ||
            (scrollContainer.style.overflowX !== "" &&
              scrollContainer.style.overflowX !== "visible") ||
            (scrollContainer.style.overflowY !== "" &&
              scrollContainer.style.overflowY !== "visible"))
        ) {
          ASPx.Evt.AttachEventToElement(
            scrollContainer,
            "scroll",
            function (evt) {
              if (typeof ASPx.GetDropDownCollection != "undefined")
                ASPx.GetDropDownCollection().ProcessControlsInContainer(
                  scrollContainer,
                  function (control) {
                    control.HideDropDown();
                  }
                );
              if (typeof ASPx.GetMenuCollection != "undefined")
                ASPx.GetMenuCollection().HideAll();
            }.aspxBind(this)
          );
        }
      }
      if (this.hideWindowWidth > 0 || this.hideWindowHeight > 0)
        this.createVisibilityCss();
      if (this.collapseWindowWidth > 0 || this.collapseWindowHeight > 0)
        this.createCollapsibilityCss();
      if (this.useAdaptivityClassNames()) this.ensureAdaptivityClassNames();
      if (this.groupName == "") {
        this.groupName =
          "DXAutoGenExpandGroup" + CollapsiblePanelsAutoGenGroupCount;
        CollapsiblePanelsAutoGenGroupCount++;
      }
      if (!CollapsiblePanelsGroups[this.groupName])
        CollapsiblePanelsGroups[this.groupName] = [];
      CollapsiblePanelsGroups[this.groupName].push(this);
      var btnElement = this.getExpandButtonElement();
      if (btnElement) {
        ASPx.Evt.AttachEventToElement(
          btnElement,
          ASPx.TouchUIHelper.touchMouseUpEventName,
          function (evt) {
            if (ASPx.Evt.IsLeftButtonPressed(evt)) this.Toggle();
          }.aspxBind(this)
        );
      }
      this.updateFixedPanelContext();
      if (!this.clientEnabled) this.SetEnabled(this.clientEnabled);
    },
    AfterInitialize: function () {
      ASPxClientPanelBase.prototype.AfterInitialize.call(this);
      var barElement = this.getExpandBarElement();
      if (barElement && this.isExpandBarChangeVisibilityOnExpanding())
        ASPx.AddClassNameToElement(barElement, "h");
      if (this.expandOnPageLoad) this.Expand(true);
    },
    OnDispose: function () {
      if (FixedPanels[this.fixedPosition] === this)
        delete FixedPanels[this.fixedPosition];
      if (ASPx.Ident.IsArray(CollapsiblePanelsGroups[this.groupName])) {
        ASPx.Data.ArrayRemove(CollapsiblePanelsGroups[this.groupName], this);
        if (CollapsiblePanelsGroups[this.groupName].length === 0)
          delete CollapsiblePanelsGroups[this.groupName];
      }
      if (ExpandedPanels[this.groupName] === this)
        delete ExpandedPanels[this.groupName];
      this.constructor.prototype.OnDispose.call(this);
    },
    AdjustControlCore: function () {
      this.updateExpandButtonPosition();
      this.updateFixedPanelContext();
    },
    GetAdjustedSizes: function () {
      var sizes = this.constructor.prototype.GetAdjustedSizes.call(this);
      var expandBar = this.getExpandBarElement();
      if (expandBar) {
        sizes["expandBarWidth"] = expandBar.offsetWidth;
        sizes["expandBarHeight"] = expandBar.offsetHeight;
      }
      return sizes;
    },
    IsDisplayed: function () {
      if (this.constructor.prototype.IsDisplayed.call(this)) return true;
      return this.IsDisplayedElement(this.getExpandBarElement());
    },
    IsHidden: function () {
      if (!this.constructor.prototype.IsHidden.call(this)) return false;
      return this.IsHiddenElement(this.getExpandBarElement());
    },
    OnBrowserWindowResize: function (evt) {
      if (this.useAdaptivityClassNames()) this.ensureAdaptivityClassNames();
      window.setTimeout(
        function () {
          this.updateExpandButtonPosition();
          this.updateFixedPanelContext();
          this.checkCollapseContent();
        }.aspxBind(this),
        0
      );
    },
    BrowserWindowResizeSubscriber: function () {
      return (
        this.isPositionFixed() ||
        this.getExpandBarElement() ||
        this.useAdaptivityClassNames()
      );
    },
    HasFixedPosition: function () {
      return this.isPositionFixed();
    },
    getSizeCore: function (element, sizeProperty) {
      return element[sizeProperty];
    },
    getFixedSize: function (sizeProperty) {
      return this.getSizeCore(this.getFixedElement(), sizeProperty);
    },
    getExpandedSize: function (sizeProperty) {
      if (
        this.getExpandBarElement() &&
        this.isElementDisplayed(this.getExpandBarElement())
      )
        return this.getSizeCore(this.GetMainElement(), sizeProperty);
      return 0;
    },
    GetWidth: function () {
      if (!this.getExpandBarElement())
        return this.constructor.prototype.GetWidth.call(this);
      var width = 0;
      if (this.isElementDisplayed(this.getExpandBarElement()))
        width += this.getExpandBarElement().offsetWidth;
      if (
        this.isElementDisplayed(this.GetMainElement()) &&
        (!this.IsExpandedInternal() || !this.isPopupExpanding())
      )
        width += this.GetMainElement().offsetWidth;
      return width;
    },
    GetHeight: function () {
      if (!this.getExpandBarElement())
        return this.constructor.prototype.GetHeight.call(this);
      var height = 0;
      if (this.isElementDisplayed(this.getExpandBarElement()))
        height += this.getExpandBarElement().offsetHeight;
      if (
        this.isElementDisplayed(this.GetMainElement()) &&
        (!this.IsExpandedInternal() || !this.isPopupExpanding())
      )
        height += this.GetMainElement().offsetHeight;
      return height;
    },
    SetVisible: function (value) {
      if (this.clientVisible != value) {
        ASPxClientPanelBase.prototype.SetVisible.call(this, value);
        var expandBarElement = this.getExpandBarElement();
        if (expandBarElement) ASPx.SetElementDisplay(expandBarElement, value);
        this.updateFixedPanelContext();
      }
    },
    updateFixedPanelContext: function () {
      if (!this.isPositionFixed()) return;
      this.updateDocumentPaddings();
      this.updateMainElementFixedPosition();
      this.updateFixedPanelsPosition();
    },
    updateExpandButtonPosition: function () {
      var expandButton = this.getExpandButtonElement();
      if (!expandButton) return;
      var isCenterPosition =
        expandButton.className.indexOf(CENTER_BTN_POSITION_SELECTOR) > -1;
      if (isCenterPosition && expandButton.offsetWidth > 0) {
        expandButton.style.width = expandButton.offsetWidth + "px";
        ASPx.SetElementFloat(expandButton, "none");
      }
      var correctButtonPosition = false;
      if (this.fixedPosition == "Top" || this.fixedPosition == "Bottom")
        correctButtonPosition = true;
      else if (this.fixedPosition == "Left" || this.fixedPosition == "Right")
        correctButtonPosition = isCenterPosition;
      else if (this.hasVerticalOrientation())
        correctButtonPosition = isCenterPosition;
      else correctButtonPosition = true;
      if (correctButtonPosition)
        this.CorrectVerticalAlignment(
          ASPx.AdjustVerticalMargins,
          this.getExpandButtonElement,
          "Btn",
          true
        );
    },
    updateDocumentPaddings: function () {
      if (!this.fixedPositionProperties) return;
      var size = this.getFixedSize(this.fixedPositionProperties.size);
      var expandedSize = 0;
      if (this.expandEffect == "Slide") {
        expandedSize = this.getExpandedSize(this.fixedPositionProperties.size);
        if (this.fixedPosition == "Right" || this.fixedPosition == "Bottom")
          expandedSize = -expandedSize;
      }
      this.changeStyleSideAttribute(
        document.documentElement,
        "padding",
        this.fixedPositionProperties.documentPadding,
        size + "px"
      );
      var documentMarginValue = this.getDocumentPropertyValue(
        this.fixedPositionProperties.documentMargin
      );
      var documentMargin2Value = this.getDocumentPropertyValue(
        this.fixedPositionProperties.documentMargin2
      );
      if (expandedSize != 0) {
        ASPx.Attr.ChangeStyleAttribute(
          document.documentElement,
          this.fixedPositionProperties.documentMargin,
          documentMarginValue + expandedSize + "px"
        );
        ASPx.Attr.ChangeStyleAttribute(
          document.documentElement,
          this.fixedPositionProperties.documentMargin2,
          documentMargin2Value - expandedSize + "px"
        );
        this.documentMarginsChanged = true;
      } else if (this.documentMarginsChanged) {
        ASPx.Attr.RestoreStyleAttribute(
          document.documentElement,
          this.fixedPositionProperties.documentMargin
        );
        ASPx.Attr.RestoreStyleAttribute(
          document.documentElement,
          this.fixedPositionProperties.documentMargin2
        );
        this.documentMarginsChanged = false;
      }
    },
    changeStyleSideAttribute: function (element, baseAttr, attr, value) {
      if (!ASPx.Browser.IE || ASPx.Browser.Version > 8)
        ASPx.Attr.ChangeStyleAttribute(element, attr, value);
      else {
        var style = ASPx.GetCurrentStyle(element);
        var top = attr == baseAttr + "-top" ? value : style[baseAttr + "Top"];
        var right =
          attr == baseAttr + "-right" ? value : style[baseAttr + "Right"];
        var bottom =
          attr == baseAttr + "-bottom" ? value : style[baseAttr + "Bottom"];
        var left =
          attr == baseAttr + "-left" ? value : style[baseAttr + "Left"];
        ASPx.Attr.ChangeStyleAttribute(
          element,
          baseAttr,
          top + " " + right + " " + bottom + " " + left
        );
      }
    },
    updateMainElementFixedPosition: function () {
      if (!this.fixedPositionProperties) return;
      var barElement = this.getExpandBarElement();
      if (barElement) {
        var size = this.getSizeCore(
          barElement,
          this.fixedPositionProperties.size
        );
        ASPx.Attr.ChangeStyleAttribute(
          this.GetMainElement(),
          this.fixedPositionProperties.contentEdge,
          size + "px"
        );
      }
    },
    updateFixedPanelsPosition: function () {
      this.updateFixedPanelsEdges(this.updateFixedPanelEdge);
      this.updateFixedPanelsEdges(this.updateFixedPanelOppositeEdge);
    },
    updateFixedPanelsEdges: function (method) {
      if (FixedPanels["Top"]) {
        if (
          FixedPanels["Left"] &&
          !FixedPanels["Top"].fixedPositionOverlap &&
          FixedPanels["Left"].fixedPositionOverlap
        )
          method.call(
            FixedPanels["Left"],
            FixedPanels["Top"],
            FixedPanels["Right"]
          );
        if (
          FixedPanels["Right"] &&
          !FixedPanels["Top"].fixedPositionOverlap &&
          FixedPanels["Right"].fixedPositionOverlap
        )
          method.call(
            FixedPanels["Right"],
            FixedPanels["Top"],
            FixedPanels["Left"]
          );
      }
      if (FixedPanels["Bottom"]) {
        if (
          FixedPanels["Left"] &&
          !FixedPanels["Bottom"].fixedPositionOverlap &&
          FixedPanels["Left"].fixedPositionOverlap
        )
          method.call(
            FixedPanels["Left"],
            FixedPanels["Bottom"],
            FixedPanels["Right"]
          );
        if (
          FixedPanels["Right"] &&
          !FixedPanels["Bottom"].fixedPositionOverlap &&
          FixedPanels["Right"].fixedPositionOverlap
        )
          method.call(
            FixedPanels["Right"],
            FixedPanels["Bottom"],
            FixedPanels["Left"]
          );
      }
      if (FixedPanels["Left"]) {
        if (
          FixedPanels["Top"] &&
          (!FixedPanels["Left"].fixedPositionOverlap ||
            FixedPanels["Top"].fixedPositionOverlap)
        )
          method.call(
            FixedPanels["Top"],
            FixedPanels["Left"],
            FixedPanels["Bottom"]
          );
        if (
          FixedPanels["Bottom"] &&
          (!FixedPanels["Left"].fixedPositionOverlap ||
            FixedPanels["Bottom"].fixedPositionOverlap)
        )
          method.call(
            FixedPanels["Bottom"],
            FixedPanels["Left"],
            FixedPanels["Top"]
          );
      }
      if (FixedPanels["Right"]) {
        if (
          FixedPanels["Top"] &&
          (!FixedPanels["Right"].fixedPositionOverlap ||
            FixedPanels["Top"].fixedPositionOverlap)
        )
          method.call(
            FixedPanels["Top"],
            FixedPanels["Right"],
            FixedPanels["Bottom"]
          );
        if (
          FixedPanels["Bottom"] &&
          (!FixedPanels["Right"].fixedPositionOverlap ||
            FixedPanels["Bottom"].fixedPositionOverlap)
        )
          method.call(
            FixedPanels["Bottom"],
            FixedPanels["Right"],
            FixedPanels["Top"]
          );
      }
    },
    updateFixedPanelEdge: function (panel) {
      var size = this.getFixedSize(this.fixedPositionProperties.size);
      if (this.expandEffect == "Slide")
        size += this.getExpandedSize(this.fixedPositionProperties.size);
      this.updateFixedPanelEdgeCore(
        panel,
        this.fixedPositionProperties.contentEdge,
        size
      );
    },
    updateFixedPanelOppositeEdge: function (panel, opppositePanel) {
      if (!this.IsExpandedInternal() && opppositePanel) return;
      if (this.expandEffect == "Slide") {
        var size = this.getExpandedSize(this.fixedPositionProperties.size);
        this.updateFixedPanelEdgeCore(
          panel,
          this.fixedPositionProperties.oppositeContentEdge,
          -size
        );
      }
    },
    updateFixedPanelEdgeCore: function (panel, edge, size) {
      var mainElement = panel.GetMainElement();
      mainElement.style[edge] = size + "px";
      var expandBarElement = panel.getExpandBarElement();
      if (expandBarElement) expandBarElement.style[edge] = size + "px";
    },
    isPositionFixed: function () {
      return !!this.fixedPositionProperties;
    },
    getFixedPosition: function () {
      var cssClass = this.GetMainElement().className;
      if (cssClass.indexOf("dxpnl-edge t") > -1) return "Top";
      if (cssClass.indexOf("dxpnl-edge b") > -1) return "Bottom";
      if (cssClass.indexOf("dxpnl-edge l") > -1) return "Left";
      if (cssClass.indexOf("dxpnl-edge r") > -1) return "Right";
      return null;
    },
    isPopupExpanding: function () {
      return !!this.expandDirectionProperties;
    },
    isExpandBarChangeVisibilityOnExpanding: function () {
      return (
        !this.isPopupExpanding() &&
        !this.isPositionFixed() &&
        CollapsiblePanelsGroups[this.groupName].length > 1
      );
    },
    createVisibilityCss: function () {
      var rules = [];
      rules.push({
        selector: "#" + this.name,
        cssText: "display: none!important;",
      });
      rules.push({
        selector: "#" + this.name + EXPAND_BAR_ID,
        cssText: "display: none!important;",
      });
      this.insertAdaptivityRules(
        rules,
        this.hideWindowWidth,
        this.hideWindowHeight,
        HIDDEN_STATE_CLASS_NAME
      );
    },
    createCollapsibilityCss: function () {
      var rules = [];
      rules.push({ selector: "#" + this.name, cssText: "display: none;" });
      rules.push({
        selector: "#" + this.name + EXPAND_BAR_ID + ".dxpnl-bar",
        cssText: this.isPositionFixed() ? "display: block;" : "display: table;",
      });
      rules.push({
        selector: "#" + this.name + "." + EXPANDED_SELECTOR,
        cssText: "display: block!important;",
      });
      this.insertAdaptivityRules(
        rules,
        this.collapseWindowWidth,
        this.collapseWindowHeight,
        COLLAPSED_STATE_CLASS_NAME
      );
    },
    insertAdaptivityRules: function (
      rules,
      maxWindowWidth,
      maxWindowHeight,
      adaptivityClassName
    ) {
      var styleSheet = ASPx.GetCurrentStyleSheet();
      if (!styleSheet) return;
      if (!this.isIE8()) {
        var mediaRule =
          "@media all and (max-width: " +
          maxWindowWidth +
          "px), (max-height: " +
          maxWindowHeight +
          "px) { ";
        for (var i = 0; i < rules.length; i++)
          mediaRule += rules[i].selector + "{" + rules[i].cssText + "}";
        mediaRule += "}";
        if (styleSheet.insertRule)
          styleSheet.insertRule(mediaRule, styleSheet.cssRules.length);
      } else
        for (var i = 0; i < rules.length; i++) {
          rules[i].selector += "." + adaptivityClassName;
          ASPx.AddStyleSheetRule(
            styleSheet,
            rules[i].selector,
            rules[i].cssText
          );
        }
    },
    ensureAdaptivityClassNames: function () {
      this.ensureAdaptivityClassName(
        HIDDEN_STATE_CLASS_NAME,
        this.hideWindowWidth,
        this.hideWindowHeight
      );
      this.ensureAdaptivityClassName(
        COLLAPSED_STATE_CLASS_NAME,
        this.collapseWindowWidth,
        this.collapseWindowHeight
      );
    },
    ensureAdaptivityClassName: function (
      adaptivityClassName,
      maxWindowWidth,
      maxWindowHeight
    ) {
      var currentDocumentWidth = ASPx.GetCurrentDocumentWidth();
      var currentDocumentHeight = ASPx.GetCurrentDocumentHeight();
      if (
        currentDocumentWidth <= maxWindowWidth ||
        currentDocumentHeight <= maxWindowHeight
      )
        this.addAdaptivityClassName(adaptivityClassName);
      else this.removeAdaptivityClassName(adaptivityClassName);
    },
    addAdaptivityClassName: function (className) {
      ASPx.AddClassNameToElement(this.GetMainElement(), className);
      if (ASPx.IsExists(this.getExpandBarElement()))
        ASPx.AddClassNameToElement(this.getExpandBarElement(), className);
    },
    removeAdaptivityClassName: function (className) {
      ASPx.RemoveClassNameFromElement(this.GetMainElement(), className);
      if (ASPx.IsExists(this.getExpandBarElement()))
        ASPx.RemoveClassNameFromElement(this.getExpandBarElement(), className);
    },
    useAdaptivityClassNames: function () {
      return (
        this.isIE8() &&
        (this.hideWindowWidth > 0 ||
          this.hideWindowHeight > 0 ||
          this.collapseWindowWidth > 0 ||
          this.collapseWindowHeight > 0)
      );
    },
    isIE8: function () {
      return ASPx.Browser.IE && ASPx.Browser.Version === 8;
    },
    Toggle: function () {
      if (this.IsExpandedInternal()) this.Collapse();
      else this.Expand();
    },
    IsExpandable: function () {
      if (
        this.GetMainElement().className.indexOf(" " + COLLAPSIBLE_SELECTOR) > -1
      )
        return true;
      if (this.collapseWindowWidth > 0 || this.collapseWindowHeight > 0) {
        var expandBarElement = this.getExpandBarElement();
        return (
          expandBarElement &&
          ASPx.GetCurrentStyle(expandBarElement).display !== "none"
        );
      }
      return false;
    },
    IsExpanded: function () {
      if (this.IsExpandable()) return this.IsExpandedInternal();
      return true;
    },
    IsExpandedInternal: function () {
      return (
        this.GetMainElement().className.indexOf(" " + EXPANDED_SELECTOR) > -1
      );
    },
    Expand: function (preventAnimation) {
      if (ExpandedPanels[this.groupName] != this) {
        if (ExpandedPanels[this.groupName])
          ExpandedPanels[this.groupName].Collapse(preventAnimation);
        this.collapseOppositePanel(preventAnimation);
        this.collapseUnfixedPopupPanels();
        ExpandedPanels[this.groupName] = this;
        ASPx.GetStateController().SelectElementBySrcElement(
          this.GetMainElement()
        );
        ASPx.GetStateController().SelectElementBySrcElement(
          this.getExpandButtonElement()
        );
        ASPx.GetControlCollection().AdjustControls(this.GetMainElement());
        if (this.isPopupExpanding() && !this.isPositionFixed())
          this.updateMainElementPosition(true);
        if (this.isExpandBarChangeVisibilityOnExpanding())
          this.slideAnimationExpandBarSize = this.getSlideAnimationSize(
            this.getExpandBarElement(),
            true
          );
        ASPx.GetStateController().SelectElementBySrcElement(
          this.getExpandBarElement()
        );
        if (!preventAnimation && this.animationType == "slide")
          this.startSlideAnimation(this.GetMainElement(), false);
        else if (!preventAnimation && this.animationType == "fade")
          this.startFadeAnimation(this.GetMainElement(), false);
        else this.expandCore();
      }
    },
    Collapse: function (preventAnimation) {
      if (ExpandedPanels[this.groupName] == this) {
        ExpandedPanels[this.groupName] = null;
        this.collapseUnfixedPopupPanels();
        if (this.isExpandBarChangeVisibilityOnExpanding()) {
          ASPx.GetStateController().DeselectElementBySrcElement(
            this.getExpandBarElement()
          );
          this.slideAnimationExpandBarSize = this.getSlideAnimationSize(
            this.getExpandBarElement(),
            true
          );
          ASPx.GetStateController().SelectElementBySrcElement(
            this.getExpandBarElement()
          );
        }
        if (!preventAnimation && this.animationType == "slide")
          this.startSlideAnimation(this.GetMainElement(), true);
        else if (!preventAnimation && this.animationType == "fade")
          this.startFadeAnimation(this.GetMainElement(), true);
        else this.collapseCore();
      }
    },
    expandCore: function () {
      if (this.isPositionFixed()) {
        this.updateFixedPanelContext();
      }
      this.raiseExpanded();
    },
    collapseCore: function () {
      ASPx.GetStateController().DeselectElementBySrcElement(
        this.GetMainElement()
      );
      ASPx.GetStateController().DeselectElementBySrcElement(
        this.getExpandButtonElement()
      );
      if (this.isPopupExpanding() && !this.isPositionFixed())
        this.updateMainElementPosition(false);
      ASPx.GetStateController().DeselectElementBySrcElement(
        this.getExpandBarElement()
      );
      if (this.isPositionFixed()) {
        this.updateFixedPanelContext();
      }
      this.slideAnimationPosProperty = null;
      this.raiseCollapsed();
    },
    collapseOppositePanel: function (preventAnimation) {
      if (!this.fixedPositionProperties) return;
      if (FixedPanels[this.fixedPositionProperties.oppositePanel])
        FixedPanels[this.fixedPositionProperties.oppositePanel].Collapse(
          preventAnimation
        );
    },
    collapseUnfixedPopupPanels: function () {
      if (!this.isPositionFixed() || this.isPopupExpanding()) return;
      for (var groupName in ExpandedPanels) {
        if (
          ExpandedPanels[groupName] &&
          !ExpandedPanels[groupName].fixedPosition &&
          ExpandedPanels[groupName].isPopupExpanding()
        )
          ExpandedPanels[groupName].Collapse(true);
      }
    },
    saveOpacity: function (element) {
      if (!this.isIE8()) ASPx.Attr.SaveStyleAttribute(element, "opacity");
      else if (ASPx.GetCurrentStyle(element).filter)
        ASPx.Attr.SaveStyleAttribute(element, "filter");
    },
    restoreOpacity: function (element) {
      if (!this.isIE8()) ASPx.Attr.RestoreStyleAttribute(element, "opacity");
      else ASPx.Attr.RestoreStyleAttribute(element, "filter");
    },
    startFadeAnimation: function (element, isCollapsing) {
      this.saveOpacity(element);
      var onComplete = function () {
        this.finishFadeAnimation(element, isCollapsing);
      }.aspxBind(this);
      if (isCollapsing)
        ASPx.AnimationHelper.fadeOut(
          element,
          onComplete,
          ASPx.AnimationConstants.Durations.SHORT
        );
      else
        ASPx.AnimationHelper.fadeIn(
          element,
          onComplete,
          ASPx.AnimationConstants.Durations.SHORT
        );
    },
    finishFadeAnimation: function (element, isCollapsing) {
      this.restoreOpacity(element);
      if (isCollapsing) this.collapseCore();
      else this.expandCore();
    },
    startSlideAnimation: function (element, isCollapsing) {
      var sizeProperty = this.getSlideAnimationSizeProperty();
      var offsetWidth = element.offsetWidth;
      var offsetHeight = element.offsetHeight;
      ASPx.Attr.SaveStyleAttribute(element, sizeProperty);
      if (element.style.overflow !== "")
        ASPx.Attr.ChangeStyleAttribute(element, "overflow", "hidden");
      else {
        ASPx.Attr.ChangeStyleAttribute(element, "overflow-x", "hidden");
        ASPx.Attr.ChangeStyleAttribute(element, "overflow-y", "hidden");
      }
      var contentContainer = this.getAnimationContentContainerElement();
      if (contentContainer) {
        if (contentContainer.style.overflow !== "")
          ASPx.Attr.ChangeStyleAttribute(
            contentContainer,
            "overflow",
            "hidden"
          );
        else {
          ASPx.Attr.ChangeStyleAttribute(
            contentContainer,
            "overflow-x",
            "hidden"
          );
          ASPx.Attr.ChangeStyleAttribute(
            contentContainer,
            "overflow-y",
            "hidden"
          );
        }
        ASPx.Attr.ChangeStyleAttribute(
          contentContainer,
          "width",
          offsetWidth -
            ASPx.GetLeftRightBordersAndPaddingsSummaryValue(element) +
            "px"
        );
        ASPx.Attr.ChangeStyleAttribute(
          contentContainer,
          "height",
          offsetHeight -
            ASPx.GetTopBottomBordersAndPaddingsSummaryValue(element) +
            "px"
        );
      }
      var transitionProperties = {
        duration: ASPx.AnimationConstants.Durations.SHORT,
        onComplete: function () {
          this.finishSlideAnimation(element, isCollapsing);
        }.aspxBind(this),
      };
      if (this.isPositionFixed())
        transitionProperties.onStep = function () {
          this.performSlideAnimationStep();
        }.aspxBind(this);
      var transition = ASPx.AnimationHelper.createMultipleAnimationTransition(
        element,
        transitionProperties
      );
      var size = this.getSlideAnimationSize(element, !this.isPositionFixed());
      var startSize = isCollapsing ? size : 0;
      var endSize = isCollapsing ? 0 : size;
      if (
        this.isExpandBarChangeVisibilityOnExpanding() &&
        this.slideAnimationExpandBarSize
      ) {
        if (startSize == 0) startSize = this.slideAnimationExpandBarSize;
        if (endSize == 0) endSize = this.slideAnimationExpandBarSize;
      }
      var properties = {};
      properties[sizeProperty] = { from: startSize, to: endSize, unit: "px" };
      if (!isCollapsing)
        ASPx.Attr.ChangeStyleAttribute(element, sizeProperty, startSize + "px");
      if (this.slideAnimationPosProperty) {
        var position = parseInt(element.style[this.slideAnimationPosProperty]);
        var startPosition = isCollapsing ? position : position + size;
        var endPosition = isCollapsing ? position + size : position;
        properties[this.slideAnimationPosProperty] = {
          from: startPosition,
          to: endPosition,
          unit: "px",
        };
        if (!isCollapsing)
          ASPx.Attr.ChangeStyleAttribute(
            element,
            this.slideAnimationPosProperty,
            startPosition + "px"
          );
      }
      transition.Start(properties);
    },
    finishSlideAnimation: function (element, isCollapsing) {
      var sizeProperty = this.getSlideAnimationSizeProperty();
      ASPx.Attr.RestoreStyleAttribute(element, sizeProperty);
      ASPx.Attr.RestoreStyleAttribute(element, "overflow");
      ASPx.Attr.RestoreStyleAttribute(element, "overflow-x");
      ASPx.Attr.RestoreStyleAttribute(element, "overflow-y");
      var contentContainer = this.getAnimationContentContainerElement();
      if (contentContainer) {
        ASPx.Attr.RestoreStyleAttribute(contentContainer, "overflow");
        ASPx.Attr.RestoreStyleAttribute(contentContainer, "overflow-x");
        ASPx.Attr.RestoreStyleAttribute(contentContainer, "overflow-y");
        ASPx.Attr.RestoreStyleAttribute(contentContainer, "width");
        ASPx.Attr.RestoreStyleAttribute(contentContainer, "height");
      }
      if (isCollapsing) this.collapseCore();
      else this.expandCore();
    },
    performSlideAnimationStep: function () {
      this.updateFixedPanelContext();
    },
    getSlideAnimationSizeProperty: function () {
      if (this.fixedPositionProperties)
        return this.fixedPositionProperties.animationSize;
      else if (this.expandDirectionProperties)
        return this.expandDirectionProperties.animationSize;
      else return this.hasVerticalOrientation() ? "width" : "height";
    },
    getSlideAnimationSize: function (element, fullSize) {
      var sizeProperty;
      if (this.fixedPositionProperties)
        sizeProperty = this.fixedPositionProperties.size;
      else if (this.expandDirectionProperties)
        sizeProperty = this.expandDirectionProperties.size;
      else
        sizeProperty = this.hasVerticalOrientation()
          ? "offsetWidth"
          : "offsetHeight";
      var size = this.getSizeCore(element, sizeProperty);
      if (fullSize) {
        if (sizeProperty == "offsetWidth")
          size -= ASPx.GetHorizontalBordersWidth(element);
        else size -= ASPx.GetVerticalBordersWidth(element);
      } else {
        if (sizeProperty == "offsetWidth")
          size -= ASPx.GetLeftRightBordersAndPaddingsSummaryValue(element);
        else size -= ASPx.GetTopBottomBordersAndPaddingsSummaryValue(element);
      }
      return size;
    },
    getSlideAnimationPosProperty: function (x, y) {
      if (this.expandEffect == "PopupToTop")
        return !y.isInverted ? "top" : null;
      if (this.expandEffect == "PopupToBottom")
        return y.isInverted ? "top" : null;
      if (this.expandEffect == "PopupToLeft")
        return !x.isInverted ? "left" : null;
      if (this.expandEffect == "PopupToRight")
        return y.isInverted ? "left" : null;
      return null;
    },
    hasVerticalOrientation: function () {
      var float = ASPx.GetElementFloat(this.GetMainElement());
      return float === "left" || float === "right";
    },
    updateMainElementPosition: function (expanded) {
      if (!this.expandDirectionProperties) return;
      if (expanded)
        this.updateMainElementExpandedPosition(this.GetMainElement());
      else this.updateMainElementCollapsedPosition(this.GetMainElement());
    },
    updateMainElementExpandedPosition: function (element) {
      if (element.style.width === "100%")
        ASPx.Attr.ChangeStyleAttribute(
          element,
          "width",
          element.parentNode.offsetWidth -
            ASPx.GetLeftRightMargins(element) +
            "px"
        );
      if (element.style.height === "100%")
        ASPx.Attr.ChangeStyleAttribute(
          element,
          "height",
          element.parentNode.offsetHeight -
            ASPx.GetTopBottomMargins(element) +
            "px"
        );
      ASPx.Attr.ChangeStyleAttribute(element, "position", "absolute");
      var barElement = this.getExpandBarElement();
      var x = ASPx.PopupUtils.GetPopupAbsoluteX(
        element,
        barElement,
        this.expandDirectionProperties.hAlign,
        0,
        0,
        0,
        false,
        false
      );
      var y = ASPx.PopupUtils.GetPopupAbsoluteY(
        element,
        barElement,
        this.expandDirectionProperties.vAlign,
        0,
        0,
        0,
        true
      );
      ASPx.Attr.ChangeStyleAttribute(element, "left", x.position + "px");
      ASPx.Attr.ChangeStyleAttribute(element, "top", y.position + "px");
      this.slideAnimationPosProperty = this.getSlideAnimationPosProperty(x, y);
    },
    updateMainElementCollapsedPosition: function (element) {
      ASPx.Attr.RestoreStyleAttribute(element, "position");
      ASPx.Attr.RestoreStyleAttribute(element, "left");
      ASPx.Attr.RestoreStyleAttribute(element, "top");
      ASPx.Attr.RestoreStyleAttribute(element, "width");
      ASPx.Attr.RestoreStyleAttribute(element, "height");
    },
    checkCollapseContent: function () {
      if (!this.getExpandBarElement()) return;
      if (this.IsExpandedInternal()) {
        if (
          CollapsiblePanelsGroups[this.groupName].length === 1 &&
          !this.isElementDisplayed(this.getExpandBarElement()) &&
          this.isElementDisplayed(this.GetMainElement())
        )
          this.Collapse(true);
        if (!this.isPositionFixed() && this.isPopupExpanding())
          this.Collapse(true);
      }
    },
    raiseCollapsed: function () {
      if (!this.Collapsed.IsEmpty()) {
        var args = new ASPxClientEventArgs();
        this.Collapsed.FireEvent(this, args);
      }
    },
    raiseExpanded: function () {
      if (!this.Expanded.IsEmpty()) {
        var args = new ASPxClientEventArgs();
        this.Expanded.FireEvent(this, args);
      }
    },
    getAnimationContentContainerElement: function () {
      if (!ASPx.IsExistsElement(this.animationContentContainerElement))
        this.animationContentContainerElement = ASPx.GetChildByClassName(
          this.GetMainElement(),
          "dxpnl-acc"
        );
      return this.animationContentContainerElement;
    },
    getScrollContentContainerElement: function () {
      if (!ASPx.IsExistsElement(this.scrollContentContainerElement))
        this.scrollContentContainerElement = ASPx.GetNodesByPartialClassName(
          this.GetMainElement(),
          "dxpnl-scc"
        )[0];
      return this.scrollContentContainerElement;
    },
    getExpandBarElement: function () {
      if (!ASPx.IsExistsElement(this.expandBarElement))
        this.expandBarElement = ASPx.GetElementById(this.name + EXPAND_BAR_ID);
      return this.expandBarElement;
    },
    getExpandButtonElement: function () {
      if (!ASPx.IsExistsElement(this.expandButtonElement))
        this.expandButtonElement = ASPx.GetElementById(
          this.name + EXPAND_BUTTON_ID
        );
      return this.expandButtonElement;
    },
    getFixedElement: function () {
      if (
        this.getExpandBarElement() &&
        this.isElementDisplayed(this.getExpandBarElement())
      )
        return this.getExpandBarElement();
      else return this.GetMainElement();
    },
    getDocumentPropertyValue: function (attr) {
      if (DocumentProperties[attr] === undefined) {
        var currentStyle = ASPx.GetCurrentStyle(document.documentElement);
        var attrValue = parseInt(ASPx.Attr.GetAttribute(currentStyle, attr));
        DocumentProperties[attr] = !isNaN(attrValue) ? attrValue : 0;
      }
      return DocumentProperties[attr];
    },
    isElementDisplayed: function (element) {
      return ASPx.GetCurrentStyle(element).display != "none";
    },
  });
  ASPxClientPanel.Cast = ASPxClientControl.Cast;
  window.ASPxClientPanelBase = ASPxClientPanelBase;
  window.ASPxClientPanel = ASPxClientPanel;
})();
(function () {
  ASPx.EnableCssAnimation = true;
  var AnimationUtils = {
    CanUseCssTransition: function () {
      return ASPx.EnableCssAnimation && this.CurrentTransition;
    },
    CanUseCssTransform: function () {
      return this.CanUseCssTransition() && this.CurrentTransform;
    },
    CurrentTransition: (function () {
      if (ASPx.Browser.IE) return null;
      var transitions = [
        { property: "webkitTransition", event: "webkitTransitionEnd" },
        { property: "MozTransition", event: "transitionend" },
        { property: "OTransition", event: "oTransitionEnd" },
        { property: "transition", event: "transitionend" },
      ];
      var fakeElement = document.createElement("DIV");
      for (var i = 0; i < transitions.length; i++)
        if (transitions[i].property in fakeElement.style) return transitions[i];
    })(),
    CurrentTransform: (function () {
      var transforms = [
        "transform",
        "MozTransform",
        "-webkit-transform",
        "msTransform",
        "OTransform",
      ];
      var fakeElement = document.createElement("DIV");
      for (var i = 0; i < transforms.length; i++)
        if (transforms[i] in fakeElement.style) return transforms[i];
    })(),
    SetTransformValue: function (element, position, isTop) {
      if (this.CanUseCssTransform())
        element.style[this.CurrentTransform] = this.GetTransformCssText(
          position,
          isTop
        );
      else element.style[!isTop ? "left" : "top"] = position + "px";
    },
    GetTransformValue: function (element, isTop) {
      if (this.CanUseCssTransform()) {
        var cssValue = element.style[this.CurrentTransform];
        return cssValue
          ? Number(
              cssValue
                .replace("matrix(1, 0, 0, 1,", "")
                .replace(")", "")
                .split(",")[!isTop ? 0 : 1]
            )
          : 0;
      } else return !isTop ? element.offsetLeft : element.offsetTop;
    },
    GetTransformCssText: function (position, isTop) {
      return (
        "matrix(1, 0, 0, 1," +
        (!isTop ? position : 0) +
        ", " +
        (!isTop ? 0 : position) +
        ")"
      );
    },
  };
  var AnimationTransitionBase = ASPx.CreateClass(null, {
    constructor: function (element, options) {
      if (element) {
        AnimationTransitionBase.Cancel(element);
        this.element = element;
        this.element.aspxTransition = this;
      }
      this.duration = options.duration || AnimationConstants.Durations.DEFAULT;
      this.transition =
        options.transition || AnimationConstants.Transitions.SINE;
      this.property = options.property;
      this.unit = options.unit || "";
      this.onComplete = options.onComplete;
      this.to = null;
      this.from = null;
    },
    Start: function (from, to) {
      if (to != undefined) {
        this.to = to;
        this.from = from;
        this.SetValue(this.from);
      } else this.to = from;
    },
    Cancel: function () {
      if (!this.element) return;
      try {
        delete this.element.aspxTransition;
      } catch (e) {
        this.element.aspxTransition = undefined;
      }
    },
    GetValue: function () {
      return this.getValueInternal(this.element, this.property);
    },
    SetValue: function (value) {
      this.setValueInternal(this.element, this.property, this.unit, value);
    },
    setValueInternal: function (element, property, unit, value) {
      if (property == "opacity") AnimationHelper.setOpacity(element, value);
      else element.style[property] = value + unit;
    },
    getValueInternal: function (element, property) {
      if (property == "opacity") return ASPx.GetElementOpacity(element);
      var value = parseFloat(element.style[property]);
      return isNaN(value) ? 0 : value;
    },
    performOnComplete: function () {
      if (this.onComplete) this.onComplete(this.element);
    },
    getTransition: function () {
      return this.transition;
    },
  });
  AnimationTransitionBase.Cancel = function (element) {
    if (element.aspxTransition) element.aspxTransition.Cancel();
  };
  var AnimationConstants = {};
  AnimationConstants.Durations = {
    SHORT: 200,
    DEFAULT: 400,
    LONG: 600,
  };
  AnimationConstants.Transitions = {
    LINER: {
      Css: "cubic-bezier(0.250, 0.250, 0.750, 0.750)",
      Js: function (progress) {
        return progress;
      },
    },
    SINE: {
      Css: "cubic-bezier(0.470, 0.000, 0.745, 0.715)",
      Js: function (progress) {
        return Math.sin(progress * 1.57);
      },
    },
    POW: {
      Css: "cubic-bezier(0.755, 0.050, 0.855, 0.060)",
      Js: function (progress) {
        return Math.pow(progress, 4);
      },
    },
    POW_EASE_OUT: {
      Css: "cubic-bezier(0.165, 0.840, 0.440, 1.000)",
      Js: function (progress) {
        return 1 - AnimationConstants.Transitions.POW.Js(1 - progress);
      },
    },
  };
  var JsAnimationTransition = ASPx.CreateClass(AnimationTransitionBase, {
    constructor: function (element, options) {
      this.constructor.prototype.constructor.call(this, element, options);
      this.onStep = options.onStep;
      this.fps = 60;
      this.startTime = null;
    },
    Start: function (from, to) {
      AnimationTransitionBase.prototype.Start.call(this, from, to);
      this.initTimer();
    },
    Cancel: function () {
      AnimationTransitionBase.prototype.Cancel.call(this);
      if (this.timerId) clearInterval(this.timerId);
    },
    initTimer: function () {
      this.startTime = new Date();
      this.timerId = window.setInterval(
        function () {
          this.onTick();
        }.aspxBind(this),
        1000 / this.fps
      );
    },
    onTick: function () {
      var progress = (new Date() - this.startTime) / this.duration;
      if (progress >= 1) this.complete();
      else {
        this.update(progress);
        if (this.onStep) this.onStep();
      }
    },
    update: function (progress) {
      this.SetValue(this.gatCalculatedValue(this.from, this.to, progress));
    },
    complete: function () {
      this.Cancel();
      this.update(1);
      this.performOnComplete();
    },
    gatCalculatedValue: function (from, to, progress) {
      if (progress == 1) return to;
      return from + (to - from) * this.getTransition()(progress);
    },
    getTransition: function () {
      return this.transition.Js;
    },
  });
  var SimpleAnimationTransition = ASPx.CreateClass(JsAnimationTransition, {
    constructor: function (options) {
      this.constructor.prototype.constructor.call(this, null, options);
      this.transition =
        options.transition || AnimationConstants.Transitions.POW_EASE_OUT;
      this.onUpdate = options.onUpdate;
      this.lastValue = 0;
    },
    SetValue: function (value) {
      this.onUpdate(value - this.lastValue);
      this.lastValue = value;
    },
    performOnComplete: function () {
      if (this.onComplete) this.onComplete();
    },
  });
  var MultipleJsAnimationTransition = ASPx.CreateClass(JsAnimationTransition, {
    constructor: function (element, options) {
      this.constructor.prototype.constructor.call(this, element, options);
      this.properties = {};
    },
    Start: function (properties) {
      this.initProperties(properties);
      this.initTimer();
    },
    initProperties: function (properties) {
      this.properties = properties;
      for (var propName in this.properties)
        if (properties[propName].from == undefined)
          properties[propName].from = this.getValueInternal(
            this.element,
            propName
          );
    },
    update: function (progress) {
      for (var propName in this.properties) {
        var property = this.properties[propName];
        if (property.from != property.to)
          this.setValueInternal(
            this.element,
            propName,
            property.unit,
            this.gatCalculatedValue(property.from, property.to, progress)
          );
      }
    },
  });
  var CssAnimationTransition = ASPx.CreateClass(AnimationTransitionBase, {
    constructor: function (element, options) {
      this.constructor.prototype.constructor.call(this, element, options);
      this.transitionPropertyName = AnimationUtils.CurrentTransition.property;
      this.eventName = AnimationUtils.CurrentTransition.event;
    },
    Start: function (from, to) {
      AnimationTransitionBase.prototype.Start.call(this, from, to);
      this.startTimerId = window.setTimeout(
        function () {
          var isHidden =
            this.element.offsetHeight == 0 && this.element.offsetWidth == 0;
          if (!isHidden) this.prepareElementBeforeAnimation();
          this.SetValue(this.to);
          if (isHidden) this.onTransitionEnd();
        }.aspxBind(this),
        0
      );
    },
    Cancel: function () {
      window.clearTimeout(this.startTimerId);
      AnimationTransitionBase.prototype.Cancel.call(this);
      ASPx.Evt.DetachEventFromElement(
        this.element,
        this.eventName,
        CssAnimationTransition.transitionEnd
      );
      this.stopAnimation();
      this.setValueInternal(this.element, this.transitionPropertyName, "", "");
    },
    prepareElementBeforeAnimation: function () {
      ASPx.Evt.AttachEventToElement(
        this.element,
        this.eventName,
        CssAnimationTransition.transitionEnd
      );
      var tmpH = this.element.offsetHeight;
      this.element.style[this.transitionPropertyName] =
        this.getTransitionCssString();
      if (
        ASPx.Browser.Safari &&
        ASPx.Browser.MacOSMobilePlatform &&
        ASPx.Browser.MajorVersion >= 8
      )
        setTimeout(
          function () {
            if (this.element && this.element.aspxTransition) {
              this.element.style[this.transitionPropertyName] = "";
              this.element.aspxTransition.onTransitionEnd();
            }
          }.aspxBind(this),
          this.duration + 100
        );
    },
    stopAnimation: function () {
      this.SetValue(ASPx.GetCurrentStyle(this.element)[this.property]);
    },
    onTransitionEnd: function () {
      this.Cancel();
      this.performOnComplete();
    },
    getTransition: function () {
      return this.transition.Css;
    },
    getTransitionCssString: function () {
      return this.getTransitionCssStringInternal(
        this.getCssName(this.property)
      );
    },
    getTransitionCssStringInternal: function (cssProperty) {
      return cssProperty + " " + this.duration + "ms " + this.getTransition();
    },
    getCssName: function (property) {
      switch (property) {
        case "marginLeft":
          return "margin-left";
        case "marginTop":
          return "margin-top";
      }
      return property;
    },
  });
  var MultipleCssAnimationTransition = ASPx.CreateClass(
    CssAnimationTransition,
    {
      constructor: function (element, options) {
        this.constructor.prototype.constructor.call(this, element, options);
        this.properties = null;
      },
      Start: function (properties) {
        this.properties = properties;
        this.forEachProperties(
          function (property, propName) {
            if (property.from !== undefined)
              this.setValueInternal(
                this.element,
                propName,
                property.unit,
                property.from
              );
          }.aspxBind(this)
        );
        this.prepareElementBeforeAnimation();
        this.forEachProperties(
          function (property, propName) {
            this.setValueInternal(
              this.element,
              propName,
              property.unit,
              property.to
            );
          }.aspxBind(this)
        );
      },
      stopAnimation: function () {
        var style = ASPx.GetCurrentStyle(this.element);
        this.forEachProperties(
          function (property, propName) {
            this.setValueInternal(this.element, propName, "", style[propName]);
          }.aspxBind(this)
        );
      },
      getTransitionCssString: function () {
        var str = "";
        this.forEachProperties(
          function (property, propName) {
            str +=
              this.getTransitionCssStringInternal(this.getCssName(propName)) +
              ",";
          }.aspxBind(this)
        );
        str = str.substring(0, str.length - 1);
        return str;
      },
      forEachProperties: function (func) {
        for (var propName in this.properties) {
          var property = this.properties[propName];
          if (property.from == undefined)
            property.from = this.getValueInternal(this.element, propName);
          if (property.from != property.to) func(property, propName);
        }
      },
    }
  );
  CssAnimationTransition.transitionEnd = function (evt) {
    var element = evt.target;
    if (element && element.aspxTransition)
      element.aspxTransition.onTransitionEnd();
  };
  var PositionAnimationTransition = ASPx.CreateClass(AnimationTransitionBase, {
    constructor: function (element, options) {
      this.constructor.prototype.constructor.call(this, element, options);
      this.direction = options.direction;
      this.animationTransition = this.createAnimationTransition();
      AnimationHelper.appendWKAnimationClassNameIfRequired(this.element);
    },
    Start: function (to) {
      var from = this.GetValue();
      if (AnimationUtils.CanUseCssTransform()) {
        from = this.convertPosToCssTransformPos(from);
        to = this.convertPosToCssTransformPos(to);
      }
      this.animationTransition.Start(from, to);
    },
    SetValue: function (value) {
      AnimationUtils.SetTransformValue(
        this.element,
        value,
        this.direction == AnimationHelper.SLIDE_VERTICAL_DIRECTION
      );
    },
    GetValue: function () {
      return AnimationUtils.GetTransformValue(
        this.element,
        this.direction == AnimationHelper.SLIDE_VERTICAL_DIRECTION
      );
    },
    createAnimationTransition: function () {
      var transition = AnimationUtils.CanUseCssTransform()
        ? this.createTransformAnimationTransition()
        : this.createPositionAnimationTransition();
      transition.transition = AnimationConstants.Transitions.POW_EASE_OUT;
      return transition;
    },
    createTransformAnimationTransition: function () {
      return new CssAnimationTransition(this.element, {
        property: AnimationUtils.CanUseCssTransform(),
        duration: this.duration,
        onComplete: this.onComplete,
      });
    },
    createPositionAnimationTransition: function () {
      return AnimationHelper.createAnimationTransition(this.element, {
        property:
          this.direction == AnimationHelper.SLIDE_VERTICAL_DIRECTION
            ? "top"
            : "left",
        unit: "px",
        duration: this.duration,
        onComplete: this.onComplete,
      });
    },
    convertPosToCssTransformPos: function (position) {
      return AnimationUtils.GetTransformCssText(
        position,
        this.direction == AnimationHelper.SLIDE_VERTICAL_DIRECTION
      );
    },
  });
  var AnimationHelper = {
    SLIDE_HORIZONTAL_DIRECTION: 0,
    SLIDE_VERTICAL_DIRECTION: 1,
    SLIDE_TOP_DIRECTION: 0,
    SLIDE_RIGHT_DIRECTION: 1,
    SLIDE_BOTTOM_DIRECTION: 2,
    SLIDE_LEFT_DIRECTION: 3,
    SLIDE_CONTAINER_CLASS: "dxAC",
    MAXIMUM_DEPTH: 3,
    createAnimationTransition: function (element, options) {
      if (options.onStep) options.animationEngine = "js";
      switch (options.animationEngine) {
        case "js":
          return new JsAnimationTransition(element, options);
        case "css":
          return new CssAnimationTransition(element, options);
        default:
          return AnimationUtils.CanUseCssTransition()
            ? new CssAnimationTransition(element, options)
            : new JsAnimationTransition(element, options);
      }
    },
    createMultipleAnimationTransition: function (element, options) {
      return AnimationUtils.CanUseCssTransition() && !options.onStep
        ? new MultipleCssAnimationTransition(element, options)
        : new MultipleJsAnimationTransition(element, options);
    },
    createSimpleAnimationTransition: function (options) {
      return new SimpleAnimationTransition(options);
    },
    cancelAnimation: function (element) {
      AnimationTransitionBase.Cancel(element);
    },
    fadeIn: function (element, onComplete, duration) {
      AnimationHelper.fadeTo(element, {
        from: 0,
        to: 1,
        onComplete: onComplete,
        duration: duration || AnimationConstants.Durations.DEFAULT,
      });
    },
    fadeOut: function (element, onComplete, duration) {
      AnimationHelper.fadeTo(element, {
        from: ASPx.GetElementOpacity(element),
        to: 0,
        onComplete: onComplete,
        duration: duration || AnimationConstants.Durations.DEFAULT,
      });
    },
    fadeTo: function (element, options) {
      options.property = "opacity";
      if (!options.duration)
        options.duration = AnimationConstants.Durations.SHORT;
      var transition = AnimationHelper.createAnimationTransition(
        element,
        options
      );
      if (!ASPx.IsExists(options.from)) options.from = transition.GetValue();
      transition.Start(options.from, options.to);
    },
    slideIn: function (element, direction, onComplete, animationEngineType) {
      AnimationHelper.setOpacity(element, 1);
      var animationContainer = AnimationHelper.getSlideAnimationContainer(
        element,
        true,
        true
      );
      var pos = AnimationHelper.getSlideInStartPos(
        animationContainer,
        direction
      );
      var transition = AnimationHelper.createSlideTransition(
        animationContainer,
        direction,
        function (el) {
          AnimationHelper.resetSlideAnimationContainerSize(animationContainer);
          if (onComplete) onComplete(el);
        },
        animationEngineType
      );
      transition.Start(pos, 0);
    },
    slideOut: function (element, direction, onComplete, animationEngineType) {
      var animationContainer = AnimationHelper.getSlideAnimationContainer(
        element,
        true,
        true
      );
      var pos = AnimationHelper.getSlideOutFinishPos(
        animationContainer,
        direction
      );
      var transition = AnimationHelper.createSlideTransition(
        animationContainer,
        direction,
        function (el) {
          AnimationHelper.setOpacity(el.firstChild, 0);
          if (onComplete) onComplete(el);
        },
        animationEngineType
      );
      transition.Start(pos);
    },
    slideTo: function (element, options) {
      if (!ASPx.IsExists(options.direction))
        options.direction = AnimationHelper.SLIDE_HORIZONTAL_DIRECTION;
      var transition = new PositionAnimationTransition(element, options);
      transition.Start(options.to);
    },
    setOpacity: function (element, value) {
      ASPx.SetElementOpacity(element, value);
    },
    appendWKAnimationClassNameIfRequired: function (element) {
      if (
        AnimationUtils.CanUseCssTransform() &&
        ASPx.Browser.WebKitFamily &&
        !ASPx.ElementHasCssClass(element, "dx-wbv")
      )
        element.className += " dx-wbv";
    },
    findSlideAnimationContainer: function (element) {
      var container = element;
      for (var i = 0; i < AnimationHelper.MAXIMUM_DEPTH; i++) {
        if (container.tagName == "BODY") return null;
        if (
          ASPx.ElementHasCssClass(
            container,
            AnimationHelper.SLIDE_CONTAINER_CLASS
          )
        )
          return container;
        container = container.parentNode;
      }
      return null;
    },
    createSlideAnimationContainer: function (element) {
      var rootContainer = document.createElement("DIV");
      ASPx.SetStyles(rootContainer, {
        className: AnimationHelper.SLIDE_CONTAINER_CLASS,
        overflow: "hidden",
      });
      var elementContainer = document.createElement("DIV");
      rootContainer.appendChild(elementContainer);
      var parentNode = element.parentNode;
      parentNode.insertBefore(rootContainer, element);
      elementContainer.appendChild(element);
      return rootContainer;
    },
    getSlideAnimationContainer: function (element, create, fixSize) {
      if (!element) return;
      var width = element.offsetWidth;
      var height = element.offsetHeight;
      var container;
      if (element.className == AnimationHelper.SLIDE_CONTAINER_CLASS)
        container = element;
      if (!container)
        container = AnimationHelper.findSlideAnimationContainer(element);
      if (!container && create)
        container = AnimationHelper.createSlideAnimationContainer(element);
      if (container && fixSize) {
        ASPx.SetStyles(container, {
          width: width,
          height: height,
        });
        ASPx.SetStyles(container.firstChild, {
          width: width,
          height: height,
        });
      }
      return container;
    },
    resetSlideAnimationContainerSize: function (container) {
      ASPx.SetStyles(container, {
        width: "",
        height: "",
      });
      ASPx.SetStyles(container.firstChild, {
        width: "",
        height: "",
      });
    },
    getModifyProperty: function (direction) {
      if (
        direction == AnimationHelper.SLIDE_TOP_DIRECTION ||
        direction == AnimationHelper.SLIDE_BOTTOM_DIRECTION
      )
        return "marginTop";
      return "marginLeft";
    },
    createSlideTransition: function (
      animationContainer,
      direction,
      complete,
      animationEngineType
    ) {
      var animationEngine = "";
      switch (animationEngineType) {
        case AnimationEngineType.JS:
          animationEngine = "js";
          break;
        case AnimationEngineType.CSS:
          animationEngine = "css";
          break;
      }
      return AnimationHelper.createAnimationTransition(
        animationContainer.firstChild,
        {
          unit: "px",
          property: AnimationHelper.getModifyProperty(direction),
          onComplete: complete,
          animationEngine: animationEngine,
        }
      );
    },
    getSlideInStartPos: function (animationContainer, direction) {
      switch (direction) {
        case AnimationHelper.SLIDE_TOP_DIRECTION:
          return animationContainer.offsetHeight;
        case AnimationHelper.SLIDE_LEFT_DIRECTION:
          return animationContainer.offsetWidth;
        case AnimationHelper.SLIDE_RIGHT_DIRECTION:
          return -animationContainer.offsetWidth;
        case AnimationHelper.SLIDE_BOTTOM_DIRECTION:
          return -animationContainer.offsetHeight;
      }
    },
    getSlideOutFinishPos: function (animationContainer, direction) {
      switch (direction) {
        case AnimationHelper.SLIDE_TOP_DIRECTION:
          return -animationContainer.offsetHeight;
        case AnimationHelper.SLIDE_LEFT_DIRECTION:
          return -animationContainer.offsetWidth;
        case AnimationHelper.SLIDE_RIGHT_DIRECTION:
          return animationContainer.offsetWidth;
        case AnimationHelper.SLIDE_BOTTOM_DIRECTION:
          return animationContainer.offsetHeight;
      }
    },
  };
  var GestureHandler = ASPx.CreateClass(null, {
    constructor: function (getAnimationElement, canHandle, allowStart) {
      this.getAnimationElement = getAnimationElement;
      this.canHandle = canHandle;
      this.allowStart = allowStart;
      this.startMousePosX = 0;
      this.startMousePosY = 0;
      this.startTime = null;
      this.isEventsPrevented = false;
      this.savedElements = [];
    },
    OnSelectStart: function (evt) {
      ASPx.Evt.PreventEvent(evt);
    },
    OnMouseDown: function (evt) {
      this.startMousePosX = ASPx.Evt.GetEventX(evt);
      this.startMousePosY = ASPx.Evt.GetEventY(evt);
      this.startTime = new Date();
    },
    OnMouseMove: function (evt) {
      if (!ASPx.Browser.MobileUI) ASPx.Selection.Clear();
      if (
        Math.abs(this.GetCurrentDistanceX(evt)) <
          GestureHandler.SLIDER_MIN_START_DISTANCE &&
        Math.abs(this.GetCurrentDistanceY(evt)) <
          GestureHandler.SLIDER_MIN_START_DISTANCE
      )
        GesturesHelper.isExecutedGesture = false;
    },
    OnMouseUp: function (evt) {},
    CanHandleEvent: function (evt) {
      return !this.canHandle || this.canHandle(evt);
    },
    IsStartAllowed: function (value) {
      return !this.allowStart || this.allowStart(value);
    },
    RollbackGesture: function () {},
    GetRubberPosition: function (position) {
      return position / GestureHandler.FACTOR_RUBBER;
    },
    GetCurrentDistanceX: function (evt) {
      return ASPx.Evt.GetEventX(evt) - this.startMousePosX;
    },
    GetCurrentDistanceY: function (evt) {
      return ASPx.Evt.GetEventY(evt) - this.startMousePosY;
    },
    GetDistanceLimit: function () {
      return new Date() - this.startTime < GestureHandler.MAX_TIME_SPAN
        ? GestureHandler.MIN_DISTANCE_LIMIT
        : GestureHandler.MAX_DISTANCE_LIMIT;
    },
    GetContainerElement: function () {},
    AttachPreventEvents: function (evt) {
      if (!this.isEventsPrevented) {
        var element = ASPx.Evt.GetEventSource(evt);
        var container = this.GetContainerElement();
        while (element && element != container) {
          ASPx.Evt.AttachEventToElement(
            element,
            "mouseup",
            ASPx.Evt.PreventEvent
          );
          ASPx.Evt.AttachEventToElement(
            element,
            "click",
            ASPx.Evt.PreventEvent
          );
          this.savedElements.push(element);
          element = element.parentNode;
        }
        this.isEventsPrevented = true;
      }
    },
    DetachPreventEvents: function () {
      if (this.isEventsPrevented) {
        window.setTimeout(
          function () {
            while (this.savedElements.length > 0) {
              var element = this.savedElements.pop();
              ASPx.Evt.DetachEventFromElement(
                element,
                "mouseup",
                ASPx.Evt.PreventEvent
              );
              ASPx.Evt.DetachEventFromElement(
                element,
                "click",
                ASPx.Evt.PreventEvent
              );
            }
          }.aspxBind(this),
          0
        );
        this.isEventsPrevented = false;
      }
    },
  });
  GestureHandler.MAX_DISTANCE_LIMIT = 70;
  GestureHandler.MIN_DISTANCE_LIMIT = 10;
  GestureHandler.MIN_START_DISTANCE = 0;
  GestureHandler.SLIDER_MIN_START_DISTANCE = 5;
  GestureHandler.MAX_TIME_SPAN = 300;
  GestureHandler.FACTOR_RUBBER = 4;
  GestureHandler.RETURN_ANIMATION_DURATION = 150;
  var SwipeSlideGestureHandler = ASPx.CreateClass(GestureHandler, {
    constructor: function (
      getAnimationElement,
      direction,
      canHandle,
      backward,
      forward,
      rollback,
      move
    ) {
      this.constructor.prototype.constructor.call(
        this,
        getAnimationElement,
        canHandle
      );
      this.slideElement = this.getAnimationElement();
      this.container = this.slideElement.parentNode;
      this.direction = direction;
      this.backward = backward;
      this.forward = forward;
      this.rollback = rollback;
      this.slideElementSize = 0;
      this.containerElementSize = 0;
      this.startSliderElementPosition = 0;
      this.centeredSlideElementPosition = 0;
    },
    OnMouseDown: function (evt) {
      GestureHandler.prototype.OnMouseDown.call(this, evt);
      this.slideElementSize = this.GetElementSize();
      this.startSliderElementPosition = this.GetElementPosition();
      this.containerElementSize = this.GetContainerElementSize();
      if (this.slideElementSize <= this.containerElementSize)
        this.centeredSlideElementPosition =
          (this.containerElementSize - this.slideElementSize) / 2;
    },
    OnMouseMove: function (evt) {
      GestureHandler.prototype.OnMouseMove.call(this, evt);
      if (
        !ASPx.Browser.TouchUI &&
        !ASPx.GetIsParent(this.container, ASPx.Evt.GetEventSource(evt))
      ) {
        GesturesHelper.OnDocumentMouseUp(evt);
        return;
      }
      var distance = this.GetCurrentDistance(evt);
      if (
        Math.abs(distance) < GestureHandler.SLIDER_MIN_START_DISTANCE ||
        ASPx.TouchUIHelper.isGesture
      )
        return;
      this.SetElementPosition(this.GetCalculatedPosition(distance));
      this.AttachPreventEvents(evt);
      ASPx.Evt.PreventEvent(evt);
    },
    GetCalculatedPosition: function (distance) {
      AnimationTransitionBase.Cancel(this.slideElement);
      var position = this.startSliderElementPosition + distance,
        maxPosition = -(this.slideElementSize - this.containerElementSize),
        minPosition = 0;
      if (this.centeredSlideElementPosition > 0)
        position =
          this.GetRubberPosition(distance) + this.centeredSlideElementPosition;
      else if (position > minPosition)
        position = this.GetRubberPosition(distance);
      else if (position < maxPosition)
        position = this.GetRubberPosition(distance) + maxPosition;
      return position;
    },
    OnMouseUp: function (evt) {
      this.DetachPreventEvents();
      if (this.GetCurrentDistance(evt) != 0) this.OnMouseUpCore(evt);
    },
    OnMouseUpCore: function (evt) {
      var distance = this.GetCurrentDistance(evt);
      if (
        this.centeredSlideElementPosition > 0 ||
        this.CheckSlidePanelIsOutOfBounds()
      )
        this.PerformRollback();
      else this.PerformAction(distance);
    },
    PerformAction: function (distance) {
      if (Math.abs(distance) < this.GetDistanceLimit()) this.PerformRollback();
      else if (distance < 0) this.PerformForward();
      else this.PerformBackward();
    },
    PerformBackward: function () {
      this.backward();
    },
    PerformForward: function () {
      this.forward();
    },
    PerformRollback: function () {
      this.rollback();
    },
    CheckSlidePanelIsOutOfBounds: function () {
      var minOffset = -(this.slideElementSize - this.containerElementSize),
        maxOffset = 0;
      var position = null,
        slideElementPos = this.GetElementPosition();
      if (slideElementPos > maxOffset || slideElementPos < minOffset)
        return true;
      return false;
    },
    GetContainerElement: function () {
      return this.container;
    },
    GetElementSize: function () {
      return this.IsHorizontalDirection()
        ? this.slideElement.offsetWidth
        : this.slideElement.offsetHeight;
    },
    GetContainerElementSize: function () {
      return this.IsHorizontalDirection()
        ? ASPx.GetClearClientWidth(this.container)
        : ASPx.GetClearClientHeight(this.container);
    },
    GetCurrentDistance: function (evt) {
      return this.IsHorizontalDirection()
        ? this.GetCurrentDistanceX(evt)
        : this.GetCurrentDistanceY(evt);
    },
    GetElementPosition: function () {
      return AnimationUtils.GetTransformValue(
        this.slideElement,
        !this.IsHorizontalDirection()
      );
    },
    SetElementPosition: function (position) {
      AnimationUtils.SetTransformValue(
        this.slideElement,
        position,
        !this.IsHorizontalDirection()
      );
    },
    IsHorizontalDirection: function () {
      return this.direction == AnimationHelper.SLIDE_HORIZONTAL_DIRECTION;
    },
  });
  var SwipeSimpleSlideGestureHandler = ASPx.CreateClass(
    SwipeSlideGestureHandler,
    {
      constructor: function (
        getAnimationElement,
        direction,
        canHandle,
        backward,
        forward,
        rollback,
        updatePosition
      ) {
        this.constructor.prototype.constructor.call(
          this,
          getAnimationElement,
          direction,
          canHandle,
          backward,
          forward,
          rollback
        );
        this.container = this.slideElement;
        this.updatePosition = updatePosition;
        this.prevDistance = 0;
      },
      OnMouseDown: function (evt) {
        GestureHandler.prototype.OnMouseDown.call(this, evt);
        this.prevDistance = 0;
      },
      OnMouseUpCore: function (evt) {
        this.PerformAction(this.GetCurrentDistance(evt));
      },
      PerformAction: function (distance) {
        if (Math.abs(distance) < this.GetDistanceLimit())
          this.PerformRollback();
        else if (distance < 0) this.PerformForward();
        else this.PerformBackward();
      },
      GetCalculatedPosition: function (distance) {
        var position = distance - this.prevDistance;
        this.prevDistance = distance;
        return position;
      },
      SetElementPosition: function (position) {
        this.updatePosition(position);
      },
    }
  );
  var SwipeGestureHandler = ASPx.CreateClass(GestureHandler, {
    constructor: function (
      getAnimationElement,
      canHandle,
      allowStart,
      start,
      allowComplete,
      complete,
      cancel,
      animationEngineType
    ) {
      this.constructor.prototype.constructor.call(
        this,
        getAnimationElement,
        canHandle,
        allowStart
      );
      this.start = start;
      this.allowComplete = allowComplete;
      this.complete = complete;
      this.cancel = cancel;
      this.animationTween = null;
      this.currentDistanceX = 0;
      this.currentDistanceY = 0;
      this.tryStartGesture = false;
      this.tryStartScrolling = false;
      this.animationEngineType = animationEngineType;
      this.UpdateAnimationContainer();
    },
    UpdateAnimationContainer: function () {
      this.animationContainer = AnimationHelper.getSlideAnimationContainer(
        this.getAnimationElement(),
        true,
        false
      );
    },
    CanHandleEvent: function (evt) {
      if (GestureHandler.prototype.CanHandleEvent.call(this, evt)) return true;
      return (
        this.animationTween &&
        this.animationContainer &&
        ASPx.GetIsParent(this.animationContainer, ASPx.Evt.GetEventSource(evt))
      );
    },
    OnMouseDown: function (evt) {
      GestureHandler.prototype.OnMouseDown.call(this, evt);
      if (this.animationTween) this.animationTween.Cancel();
      this.currentDistanceX = 0;
      this.currentDistanceY = 0;
      this.tryStartGesture = false;
      this.tryStartScrolling = false;
    },
    OnMouseMove: function (evt) {
      GestureHandler.prototype.OnMouseMove.call(this, evt);
      this.currentDistanceX = this.GetCurrentDistanceX(evt);
      this.currentDistanceY = this.GetCurrentDistanceY(evt);
      if (
        !this.animationTween &&
        !this.tryStartScrolling &&
        (Math.abs(this.currentDistanceX) > GestureHandler.MIN_START_DISTANCE ||
          Math.abs(this.currentDistanceY) > GestureHandler.MIN_START_DISTANCE)
      ) {
        if (Math.abs(this.currentDistanceY) < Math.abs(this.currentDistanceX)) {
          this.tryStartGesture = true;
          if (this.IsStartAllowed(this.currentDistanceX)) {
            this.animationContainer =
              AnimationHelper.getSlideAnimationContainer(
                this.getAnimationElement(),
                true,
                true
              );
            this.animationTween = AnimationHelper.createSlideTransition(
              this.animationContainer,
              AnimationHelper.SLIDE_LEFT_DIRECTION,
              function () {
                AnimationHelper.resetSlideAnimationContainerSize(
                  this.animationContainer
                );
                this.animationContainer = null;
                this.animationTween = null;
              }.aspxBind(this),
              this.animationEngineType
            );
            this.PerformStart(this.currentDistanceX);
            this.AttachPreventEvents(evt);
          }
        } else this.tryStartScrolling = true;
      }
      if (this.animationTween) {
        if (this.allowComplete && !this.allowComplete(this.currentDistanceX))
          this.currentDistanceX = this.GetRubberPosition(this.currentDistanceX);
        this.animationTween.SetValue(this.currentDistanceX);
      }
      if (
        !this.tryStartScrolling &&
        !ASPx.TouchUIHelper.isGesture &&
        evt.touches &&
        evt.touches.length < 2
      )
        ASPx.Evt.PreventEvent(evt);
    },
    OnMouseUp: function (evt) {
      if (!this.animationTween) {
        if (this.tryStartGesture) this.PerformCancel(this.currentDistanceX);
      } else {
        if (Math.abs(this.currentDistanceX) < this.GetDistanceLimit())
          this.RollbackGesture();
        else {
          if (this.IsCompleteAllowed(this.currentDistanceX)) {
            this.PerformComplete(this.currentDistanceX);
            this.animationContainer = null;
            this.animationTween = null;
          } else this.RollbackGesture();
        }
      }
      this.DetachPreventEvents();
      this.tryStartGesture = false;
      this.tryStartScrolling = false;
    },
    PerformStart: function (value) {
      if (this.start) this.start(value);
    },
    IsCompleteAllowed: function (value) {
      return !this.allowComplete || this.allowComplete(value);
    },
    PerformComplete: function (value) {
      if (this.complete) this.complete(value);
    },
    PerformCancel: function (value) {
      if (this.cancel) this.cancel(value);
    },
    RollbackGesture: function () {
      this.animationTween.Start(this.currentDistanceX, 0);
    },
    GetContainerElement: function () {
      return this.animationContainer;
    },
  });
  var GesturesHelper = {
    handlers: {},
    activeHandler: null,
    isAttachedEvents: false,
    isExecutedGesture: false,
    AddSwipeGestureHandler: function (
      id,
      getAnimationElement,
      canHandle,
      allowStart,
      start,
      allowComplete,
      complete,
      cancel,
      animationEngineType
    ) {
      this.handlers[id] = new SwipeGestureHandler(
        getAnimationElement,
        canHandle,
        allowStart,
        start,
        allowComplete,
        complete,
        cancel,
        animationEngineType
      );
    },
    UpdateSwipeAnimationContainer: function (id) {
      if (this.handlers[id]) this.handlers[id].UpdateAnimationContainer();
    },
    AddSwipeSlideGestureHandler: function (
      id,
      getAnimationElement,
      direction,
      canHandle,
      backward,
      forward,
      rollback,
      updatePosition
    ) {
      if (updatePosition)
        this.handlers[id] = new SwipeSimpleSlideGestureHandler(
          getAnimationElement,
          direction,
          canHandle,
          backward,
          forward,
          rollback,
          updatePosition
        );
      else
        this.handlers[id] = new SwipeSlideGestureHandler(
          getAnimationElement,
          direction,
          canHandle,
          backward,
          forward,
          rollback
        );
    },
    canHandleMouseDown: function (evt) {
      if (!ASPx.Evt.IsLeftButtonPressed(evt)) return false;
      var element = ASPx.Evt.GetEventSource(evt);
      var dxFocusedEditor =
        typeof ASPxClientEdit != "undefined" &&
        ASPxClientEdit.GetFocusedEditor();
      if (dxFocusedEditor && dxFocusedEditor.IsEditorElement(element))
        return false;
      var isTextEditor =
        element.tagName == "TEXTAREA" ||
        (element.tagName == "INPUT" &&
          ASPx.Attr.GetAttribute(element, "type") == "text");
      if (isTextEditor && document.activeElement == element) return false;
      return true;
    },
    OnDocumentSelectStart: function (evt) {
      if (GesturesHelper.activeHandler && GesturesHelper.isExecutedGesture)
        GesturesHelper.activeHandler.OnSelectStart(evt);
    },
    OnDocumentMouseDown: function (evt) {
      if (!GesturesHelper.canHandleMouseDown(evt)) return;
      GesturesHelper.activeHandler = GesturesHelper.FindHandler(evt);
      if (GesturesHelper.activeHandler)
        GesturesHelper.activeHandler.OnMouseDown(evt);
    },
    OnDocumentMouseMove: function (evt) {
      if (GesturesHelper.activeHandler) {
        GesturesHelper.isExecutedGesture = true;
        GesturesHelper.activeHandler.OnMouseMove(evt);
      }
    },
    OnDocumentMouseUp: function (evt) {
      if (GesturesHelper.activeHandler) {
        GesturesHelper.activeHandler.OnMouseUp(evt);
        GesturesHelper.activeHandler = null;
        window.setTimeout(function () {
          GesturesHelper.isExecutedGesture = false;
        }, 0);
      }
    },
    AttachEvents: function () {
      if (!GesturesHelper.isAttachedEvents) {
        GesturesHelper.Attach(ASPx.Evt.AttachEventToElement);
        GesturesHelper.isAttachedEvents = true;
      }
    },
    DetachEvents: function () {
      if (GesturesHelper.isAttachedEvents) {
        GesturesHelper.Attach(ASPx.Evt.DetachEventFromElement);
        GesturesHelper.isAttachedEvents = false;
      }
    },
    Attach: function (changeEventsMethod) {
      var doc = window.document;
      changeEventsMethod(
        doc,
        ASPx.TouchUIHelper.touchMouseDownEventName,
        GesturesHelper.OnDocumentMouseDown
      );
      changeEventsMethod(
        doc,
        ASPx.TouchUIHelper.touchMouseMoveEventName,
        GesturesHelper.OnDocumentMouseMove
      );
      changeEventsMethod(
        doc,
        ASPx.TouchUIHelper.touchMouseUpEventName,
        GesturesHelper.OnDocumentMouseUp
      );
      if (!ASPx.Browser.MobileUI)
        changeEventsMethod(
          doc,
          "selectstart",
          GesturesHelper.OnDocumentSelectStart
        );
    },
    FindHandler: function (evt) {
      var handlers = [];
      for (var id in GesturesHelper.handlers) {
        var handler = GesturesHelper.handlers[id];
        if (handler.CanHandleEvent && handler.CanHandleEvent(evt))
          handlers.push(handler);
      }
      if (!handlers.length) return null;
      handlers.sort(function (a, b) {
        return ASPx.GetIsParent(
          a.getAnimationElement(),
          b.getAnimationElement()
        )
          ? 1
          : -1;
      });
      return handlers[0];
    },
    IsExecutedGesture: function () {
      return GesturesHelper.isExecutedGesture;
    },
  };
  GesturesHelper.AttachEvents();
  var AnimationEngineType = {
    JS: 0,
    CSS: 1,
    DEFAULT: 2,
  };
  ASPx.AnimationEngineType = AnimationEngineType;
  ASPx.AnimationUtils = AnimationUtils;
  ASPx.AnimationConstants = AnimationConstants;
  ASPx.AnimationHelper = AnimationHelper;
  ASPx.GesturesHelper = GesturesHelper;
})();
(function () {
  var PopupUtils = {
    NotSetAlignIndicator: "NotSet",
    InnerAlignIndicator: "Sides",
    OutsideLeftAlignIndicator: "OutsideLeft",
    LeftSidesAlignIndicator: "LeftSides",
    RightSidesAlignIndicator: "RightSides",
    OutsideRightAlignIndicator: "OutsideRight",
    CenterAlignIndicator: "Center",
    AboveAlignIndicator: "Above",
    TopSidesAlignIndicator: "TopSides",
    MiddleAlignIndicator: "Middle",
    BottomSidesAlignIndicator: "BottomSides",
    BelowAlignIndicator: "Below",
    IsAlignNotSet: function (align) {
      return align == PopupUtils.NotSetAlignIndicator;
    },
    IsInnerAlign: function (align) {
      return align.indexOf(PopupUtils.InnerAlignIndicator) != -1;
    },
    IsRightSidesAlign: function (align) {
      return align == PopupUtils.RightSidesAlignIndicator;
    },
    IsOutsideRightAlign: function (align) {
      return align == PopupUtils.OutsideRightAlignIndicator;
    },
    IsCenterAlign: function (align) {
      return align == PopupUtils.CenterAlignIndicator;
    },
    FindPopupElementById: function (id) {
      if (id == "") return null;
      var popupElement = ASPx.GetElementById(id);
      if (!ASPx.IsExistsElement(popupElement)) {
        var idParts = id.split("_");
        var uniqueId = idParts.join("$");
        popupElement = ASPx.GetElementById(uniqueId);
      }
      return popupElement;
    },
    FindEventSourceParentByTestFunc: function (evt, testFunc) {
      return ASPx.GetParent(ASPx.Evt.GetEventSource(evt), testFunc);
    },
    PreventContextMenu: function (evt) {
      if (evt.stopPropagation) evt.stopPropagation();
      if (evt.preventDefault) evt.preventDefault();
      if (ASPx.Browser.WebKitFamily) evt.returnValue = false;
    },
    GetDocumentClientWidthForPopup: function () {
      return ASPx.Browser.WebKitTouchUI
        ? ASPx.GetDocumentWidth()
        : ASPx.GetDocumentClientWidth();
    },
    GetDocumentClientHeightForPopup: function () {
      return ASPx.Browser.WebKitTouchUI
        ? ASPx.GetDocumentHeight()
        : ASPx.GetDocumentClientHeight();
    },
    AdjustPositionToClientScreen: function (element, pos, rtl, isX) {
      var min = isX
          ? ASPx.GetDocumentScrollLeft()
          : ASPx.GetDocumentScrollTop(),
        viewPortWidth = ASPx.Browser.WebKitTouchUI
          ? window.innerWidth
          : ASPx.GetDocumentClientWidth(),
        max = min + (isX ? viewPortWidth : ASPx.GetDocumentClientHeight());
      max -= isX ? element.offsetWidth : element.offsetHeight;
      if (rtl) {
        if (pos < min) pos = min;
        if (pos > max) pos = max;
      } else {
        if (pos > max) pos = max;
        if (pos < min) pos = min;
      }
      return pos;
    },
    GetPopupAbsoluteX: function (
      element,
      popupElement,
      hAlign,
      hOffset,
      x,
      left,
      rtl,
      isPopupFullCorrectionOn
    ) {
      var width = element.offsetWidth;
      var bodyWidth = ASPx.GetDocumentClientWidth();
      var elementX = ASPx.GetAbsoluteX(popupElement);
      var scrollX = ASPx.GetDocumentScrollLeft();
      if (hAlign == "WindowCenter") {
        var showAtPos = x != ASPx.InvalidPosition && !popupElement;
        if (showAtPos) hAlign = "";
        else
          return new ASPx.PopupPosition(
            Math.ceil(
              (ASPx.Browser.WebKitTouchUI ? window.innerWidth : bodyWidth) / 2 -
                width / 2
            ) +
              scrollX +
              hOffset,
            false
          );
      }
      if (popupElement) {
        var leftX = elementX - width;
        var rightX = elementX + popupElement.offsetWidth;
        var innerLeftX = elementX;
        var innerRightX = elementX + popupElement.offsetWidth - width;
        var isMoreFreeSpaceLeft =
          bodyWidth - (rightX + width) < leftX - 2 * scrollX;
      } else hAlign = "";
      var isInverted = false;
      if (hAlign == PopupUtils.OutsideLeftAlignIndicator) {
        isInverted =
          isPopupFullCorrectionOn &&
          !(leftX - scrollX > 0 || isMoreFreeSpaceLeft);
        if (isInverted) x = rightX - hOffset;
        else x = leftX + hOffset;
      } else if (hAlign == PopupUtils.LeftSidesAlignIndicator) {
        x = innerLeftX + hOffset;
        if (isPopupFullCorrectionOn)
          x = PopupUtils.AdjustPositionToClientScreen(element, x, rtl, true);
      } else if (hAlign == PopupUtils.CenterAlignIndicator) {
        x =
          elementX +
          Math.round((popupElement.offsetWidth - width) / 2) +
          hOffset;
      } else if (hAlign == PopupUtils.RightSidesAlignIndicator) {
        x = innerRightX + hOffset;
        if (isPopupFullCorrectionOn)
          x = PopupUtils.AdjustPositionToClientScreen(element, x, rtl, true);
      } else if (hAlign == PopupUtils.OutsideRightAlignIndicator) {
        isInverted =
          isPopupFullCorrectionOn &&
          !(rightX + width < bodyWidth + scrollX || !isMoreFreeSpaceLeft);
        if (isInverted) x = leftX - hOffset;
        else x = rightX + hOffset;
      } else {
        if (rtl) {
          if (!ASPx.IsValidPosition(x)) {
            if (popupElement) x = innerRightX;
            else if (hOffset) x = 0;
            else x = left;
          } else x -= width;
          isInverted =
            isPopupFullCorrectionOn &&
            x < scrollX &&
            x - scrollX < bodyWidth / 2;
          if (isInverted) x = x + width + hOffset;
          else x = x - hOffset;
        } else {
          if (!ASPx.IsValidPosition(x)) {
            if (popupElement) x = elementX;
            else if (hOffset) x = 0;
            else x = left;
          }
          isInverted =
            isPopupFullCorrectionOn &&
            x - scrollX + width > bodyWidth &&
            x - scrollX > bodyWidth / 2;
          if (isInverted) x = x - width - hOffset;
          else x = x + hOffset;
        }
      }
      return new ASPx.PopupPosition(x, isInverted);
    },
    GetPopupAbsoluteY: function (
      element,
      popupElement,
      vAlign,
      vOffset,
      y,
      top,
      isPopupFullCorrectionOn
    ) {
      var height = element.offsetHeight;
      var bodyHeight = ASPx.GetDocumentClientHeight();
      var elementY = ASPx.GetAbsoluteY(popupElement);
      var scrollY = ASPx.GetDocumentScrollTop();
      if (vAlign == "WindowCenter") {
        var showAtPos = y != ASPx.InvalidPosition && !popupElement;
        if (showAtPos) hAlign = "";
        else
          return new ASPx.PopupPosition(
            Math.ceil(
              (ASPx.Browser.WebKitTouchUI ? window.innerHeight : bodyHeight) /
                2 -
                height / 2
            ) +
              scrollY +
              vOffset,
            false
          );
      }
      if (popupElement) {
        var bottomY = elementY + popupElement.offsetHeight;
        var topY = elementY - height;
        var innerBottomY = elementY + popupElement.offsetHeight - height;
        var innerTopY = elementY;
        var isMoreFreeSpaceAbove =
          bodyHeight - (bottomY + height) < topY - 2 * scrollY;
      } else vAlign = "";
      var isInverted = false;
      if (vAlign == PopupUtils.AboveAlignIndicator) {
        isInverted =
          isPopupFullCorrectionOn &&
          !(topY - scrollY > 0 || isMoreFreeSpaceAbove);
        if (isInverted) y = bottomY - vOffset;
        else y = topY + vOffset;
      } else if (vAlign == PopupUtils.TopSidesAlignIndicator) {
        y = innerTopY + vOffset;
        if (isPopupFullCorrectionOn)
          y = PopupUtils.AdjustPositionToClientScreen(element, y, false, false);
      } else if (vAlign == PopupUtils.MiddleAlignIndicator) {
        y =
          elementY +
          Math.round((popupElement.offsetHeight - height) / 2) +
          vOffset;
      } else if (vAlign == PopupUtils.BottomSidesAlignIndicator) {
        y = innerBottomY + vOffset;
        if (isPopupFullCorrectionOn)
          y = PopupUtils.AdjustPositionToClientScreen(element, y, false, false);
      } else if (vAlign == PopupUtils.BelowAlignIndicator) {
        isInverted =
          isPopupFullCorrectionOn &&
          !(bottomY + height < bodyHeight + scrollY || !isMoreFreeSpaceAbove);
        if (isInverted) y = topY - vOffset;
        else y = bottomY + vOffset;
      } else {
        if (!ASPx.IsValidPosition(y)) {
          if (popupElement) y = ASPx.GetAbsoluteY(popupElement);
          else if (vOffset) y = 0;
          else y = top;
        }
        isInverted =
          isPopupFullCorrectionOn &&
          y - ASPx.GetDocumentScrollTop() + height > bodyHeight &&
          y - ASPx.GetDocumentScrollTop() > bodyHeight / 2;
        if (isInverted) y = y - height - vOffset;
        else y = y + vOffset;
      }
      return new ASPx.PopupPosition(y, isInverted);
    },
    RemoveFocus: function (parent) {
      var div = document.createElement("div");
      div.tabIndex = "-1";
      PopupUtils.ConcealDivElement(div);
      parent.appendChild(div);
      if (ASPx.IsFocusable(div)) div.focus();
      ASPx.RemoveElement(div);
    },
    ConcealDivElement: function (div) {
      div.style.position = "absolute";
      div.style.left = 0;
      div.style.top = 0;
      if (ASPx.Browser.WebKitFamily) {
        div.style.opacity = 0;
        div.style.width = 1;
        div.style.height = 1;
      } else {
        div.style.border = 0;
        div.style.width = 0;
        div.style.height = 0;
      }
    },
    InitAnimationDiv: function (
      element,
      x,
      y,
      onAnimStopCallString,
      skipSizeInit
    ) {
      PopupUtils.InitAnimationDivCore(element);
      element.popuping = true;
      element.onAnimStopCallString = onAnimStopCallString;
      if (!skipSizeInit)
        ASPx.SetStyles(element, {
          width: element.offsetWidth,
          height: element.offsetHeight,
        });
      ASPx.SetStyles(element, { left: x, top: y });
    },
    InitAnimationDivCore: function (element) {
      ASPx.SetStyles(element, {
        overflow: "hidden",
        position: "absolute",
      });
    },
    StartSlideAnimation: function (
      animationDivElement,
      element,
      iframeElement,
      duration,
      preventChangingWidth,
      preventChangingHeight
    ) {
      if (iframeElement) {
        var endLeft = ASPx.PxToInt(iframeElement.style.left);
        var endTop = ASPx.PxToInt(iframeElement.style.top);
        var startLeft =
          ASPx.PxToInt(element.style.left) < 0
            ? endLeft
            : animationDivElement.offsetLeft + animationDivElement.offsetWidth;
        var startTop =
          ASPx.PxToInt(element.style.top) < 0
            ? endTop
            : animationDivElement.offsetTop + animationDivElement.offsetHeight;
        var properties = {
          left: { from: startLeft, to: endLeft, unit: "px" },
          top: { from: startTop, to: endTop, unit: "px" },
        };
        if (!preventChangingWidth)
          properties["width"] = { to: element.offsetWidth, unit: "px" };
        if (!preventChangingHeight)
          properties["height"] = { to: element.offsetHeight, unit: "px" };
        ASPx.AnimationHelper.createMultipleAnimationTransition(iframeElement, {
          duration: duration,
        }).Start(properties);
      }
      ASPx.AnimationHelper.createMultipleAnimationTransition(element, {
        duration: duration,
        onComplete: function () {
          PopupUtils.AnimationFinished(animationDivElement, element);
        },
      }).Start({
        left: { to: 0, unit: "px" },
        top: { to: 0, unit: "px" },
      });
    },
    AnimationFinished: function (animationDivElement, element) {
      if (
        PopupUtils.StopAnimation(animationDivElement, element) &&
        ASPx.IsExists(animationDivElement.onAnimStopCallString) &&
        animationDivElement.onAnimStopCallString !== ""
      ) {
        window.setTimeout(animationDivElement.onAnimStopCallString, 0);
      }
    },
    StopAnimation: function (animationDivElement, element) {
      if (animationDivElement.popuping) {
        ASPx.AnimationHelper.cancelAnimation(element);
        animationDivElement.popuping = false;
        animationDivElement.style.overflow = "visible";
        return true;
      }
      return false;
    },
    GetAnimationHorizontalDirection: function (
      popupPosition,
      horizontalAlign,
      verticalAlign,
      rtl
    ) {
      if (
        PopupUtils.IsInnerAlign(horizontalAlign) &&
        !PopupUtils.IsInnerAlign(verticalAlign) &&
        !PopupUtils.IsAlignNotSet(verticalAlign)
      )
        return 0;
      var toTheLeft =
        (horizontalAlign == PopupUtils.OutsideLeftAlignIndicator ||
          horizontalAlign == PopupUtils.RightSidesAlignIndicator ||
          (horizontalAlign == PopupUtils.NotSetAlignIndicator && rtl)) ^
        popupPosition.isInverted;
      return toTheLeft ? 1 : -1;
    },
    GetAnimationVerticalDirection: function (
      popupPosition,
      horizontalAlign,
      verticalAlign
    ) {
      if (
        PopupUtils.IsInnerAlign(verticalAlign) &&
        !PopupUtils.IsInnerAlign(horizontalAlign) &&
        !PopupUtils.IsAlignNotSet(horizontalAlign)
      )
        return 0;
      var toTheTop =
        (verticalAlign == PopupUtils.AboveAlignIndicator ||
          verticalAlign == PopupUtils.BottomSidesAlignIndicator) ^
        popupPosition.isInverted;
      return toTheTop ? 1 : -1;
    },
    IsVerticalScrollExists: function () {
      var scrollIsNotHidden =
        ASPx.GetCurrentStyle(document.body).overflowY !== "hidden" &&
        ASPx.GetCurrentStyle(document.documentElement).overflowY !== "hidden";
      return (
        scrollIsNotHidden &&
        ASPx.GetDocumentHeight() > ASPx.GetDocumentClientHeight()
      );
    },
    CoordinatesInDocumentRect: function (x, y) {
      var docScrollLeft = ASPx.GetDocumentScrollLeft();
      var docScrollTop = ASPx.GetDocumentScrollTop();
      return (
        x > docScrollLeft &&
        y > docScrollTop &&
        x < ASPx.GetDocumentClientWidth() + docScrollLeft &&
        y < ASPx.GetDocumentClientHeight() + docScrollTop
      );
    },
    GetElementZIndexArray: function (element) {
      var currentElement = element;
      var zIndexesArray = [0];
      while (currentElement && currentElement.tagName != "BODY") {
        if (currentElement.style) {
          if (
            typeof currentElement.style.zIndex != "undefined" &&
            currentElement.style.zIndex != ""
          )
            zIndexesArray.unshift(currentElement.style.zIndex);
        }
        currentElement = currentElement.parentNode;
      }
      return zIndexesArray;
    },
    IsHigher: function (higherZIndexArrat, zIndexArray) {
      if (zIndexArray == null) return true;
      var count =
        higherZIndexArrat.length >= zIndexArray.length
          ? higherZIndexArrat.length
          : zIndexArray.length;
      for (var i = 0; i < count; i++)
        if (
          typeof higherZIndexArrat[i] != "undefined" &&
          typeof zIndexArray[i] != "undefined"
        ) {
          var higherZIndexArrayCurrentElement = parseInt(
            higherZIndexArrat[i].toString()
          );
          var zIndexArrayCurrentElement = parseInt(zIndexArray[i].toString());
          if (higherZIndexArrayCurrentElement != zIndexArrayCurrentElement)
            return higherZIndexArrayCurrentElement > zIndexArrayCurrentElement;
        } else return typeof zIndexArray[i] == "undefined";
      return true;
    },
    TestIsPopupElement: function (element) {
      return !!element.DXPopupElementControl;
    },
  };
  PopupUtils.OverControl = {
    GetPopupElementByEvt: function (evt) {
      return PopupUtils.FindEventSourceParentByTestFunc(
        evt,
        PopupUtils.TestIsPopupElement
      );
    },
    OnMouseEvent: function (evt, mouseOver) {
      var popupElement = PopupUtils.OverControl.GetPopupElementByEvt(evt);
      if (mouseOver)
        popupElement.DXPopupElementControl.OnPopupElementMouseOver(
          evt,
          popupElement
        );
      else
        popupElement.DXPopupElementControl.OnPopupElementMouseOut(
          evt,
          popupElement
        );
    },
    OnMouseOut: function (evt) {
      PopupUtils.OverControl.OnMouseEvent(evt, false);
    },
    OnMouseOver: function (evt) {
      PopupUtils.OverControl.OnMouseEvent(evt, true);
    },
  };
  PopupUtils.BodyScrollHelper = (function () {
    var windowScrollLock = {};
    function lockWindowScroll(windowId) {
      windowScrollLock[windowId] = true;
    }
    function unlockWindowScroll(windowId) {
      windowScrollLock[windowId] = false;
    }
    function isAnyWindowScrollLocked() {
      for (var key in windowScrollLock) if (windowScrollLock[key]) return true;
      return false;
    }
    function fixScrollsBug() {
      var scrollTop = document.body.scrollTop;
      var scrollLeft = document.body.scrollLeft;
      document.body.scrollTop++;
      document.body.scrollTop--;
      document.body.scrollLeft++;
      document.body.scrollLeft--;
      document.body.scrollLeft = scrollLeft;
      document.body.scrollTop = scrollTop;
    }
    return {
      HideBodyScroll: function (windowId) {
        if (ASPx.Browser.WebKitTouchUI) return;
        if (isAnyWindowScrollLocked()) {
          lockWindowScroll(windowId);
          return;
        }
        lockWindowScroll(windowId);
        var verticalScrollMustBeReplacedByMargin =
          PopupUtils.IsVerticalScrollExists();
        if (ASPx.Browser.IE) {
          ASPx.Attr.ChangeAttribute(document.body, "scroll", "no");
          ASPx.Attr.ChangeStyleAttribute(
            document.documentElement,
            "overflow",
            "hidden"
          );
        } else if (ASPx.Browser.Firefox && ASPx.Browser.Version < 3) {
          var scrollTop = document.documentElement.scrollTop;
          ASPx.Attr.ChangeStyleAttribute(document.body, "overflow", "hidden");
          document.documentElement.scrollTop = scrollTop;
        } else {
          ASPx.Attr.ChangeStyleAttribute(
            document.documentElement,
            "overflow",
            "hidden"
          );
          var documentHeight = ASPx.GetDocumentHeight();
          var documentWidth = ASPx.GetDocumentWidth();
          if (
            window.pageYOffset > 0 &&
            ASPx.PxToInt(window.getComputedStyle(document.body, null)) !=
              documentHeight
          )
            ASPx.Attr.ChangeStyleAttribute(
              document.body,
              "height",
              documentHeight + "px"
            );
          if (
            window.pageXOffset > 0 &&
            ASPx.PxToInt(window.getComputedStyle(document.body, null)) !=
              documentWidth
          )
            ASPx.Attr.ChangeStyleAttribute(
              document.body,
              "width",
              documentWidth + "px"
            );
          if (ASPx.Browser.Chrome) {
            fixScrollsBug();
          }
        }
        if (verticalScrollMustBeReplacedByMargin) {
          var currentBodyStyle = ASPx.GetCurrentStyle(document.body),
            marginWidth =
              ASPx.GetVerticalScrollBarWidth() +
              ASPx.PxToInt(currentBodyStyle.marginRight);
          ASPx.Attr.ChangeStyleAttribute(
            document.body,
            "margin-right",
            marginWidth + "px"
          );
        }
      },
      RestoreBodyScroll: function (windowId) {
        if (ASPx.Browser.WebKitTouchUI) return;
        unlockWindowScroll(windowId);
        if (isAnyWindowScrollLocked()) return;
        if (ASPx.Browser.IE) {
          ASPx.Attr.RestoreAttribute(document.body, "scroll");
          ASPx.Attr.RestoreStyleAttribute(document.documentElement, "overflow");
        } else {
          ASPx.Attr.RestoreStyleAttribute(document.documentElement, "overflow");
        }
        ASPx.Attr.RestoreStyleAttribute(document.body, "margin-right");
        ASPx.Attr.RestoreStyleAttribute(document.body, "height");
        ASPx.Attr.RestoreStyleAttribute(document.body, "width");
        if (ASPx.Browser.WebKitFamily) {
          fixScrollsBug();
        }
      },
    };
  })();
  ASPx.PopupPosition = function (position, isInverted) {
    this.position = position;
    this.isInverted = isInverted;
  };
  ASPx.PopupSize = function (width, height) {
    this.width = width;
    this.height = height;
  };
  ASPx.PopupUtils = PopupUtils;
})();
(function () {
  ASPxClientCallbackPanel = ASPx.CreateClass(ASPxClientPanel, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.hideContentOnCallback = true;
      this.isLoadingPanelTextEmpty = false;
    },
    OnCallback: function (result) {
      ASPx.SetInnerHtml(this.getContentElement(), result);
      if (this.touchUIScroller)
        this.touchUIScroller.ChangeElement(this.getContentElement());
    },
    ShowLoadingPanel: function () {
      var element = this.getContentElement();
      var mainElement =
        element.tagName == "TD" ? this.GetMainElement() : element;
      if (!this.hideContentOnCallback)
        this.CreateLoadingPanelWithAbsolutePosition(
          this.GetMainElement().parentNode,
          mainElement
        );
      else this.CreateLoadingPanelInsideContainer(element, true, true, false);
    },
    ShowLoadingDiv: function () {
      this.CreateLoadingDiv(
        this.GetMainElement().parentNode,
        this.getContentElement()
      );
    },
    GetCallbackAnimationElement: function () {
      return this.getContentElement();
    },
    PerformCallback: function (parameter) {
      this.CreateCallback(parameter);
    },
    CreateCallback: function (arg, command, callbackInfo) {
      this.ShowLoadingElements();
      ASPxClientControl.prototype.CreateCallback.call(this, arg, command);
    },
    GetLoadingPanelTextLabelID: function () {
      return this.name + "_TL";
    },
    GetLoadingPanelTextLabel: function () {
      return ASPx.GetElementById(this.GetLoadingPanelTextLabelID());
    },
    GetLoadingPanelText: function () {
      var textLabel = this.GetLoadingPanelTextLabel();
      if (textLabel && !this.isLoadingPanelTextEmpty)
        return textLabel.innerHTML;
      return "";
    },
    SetLoadingPanelText: function (text) {
      this.isLoadingPanelTextEmpty = text == null || text == "";
      var textLabel = this.GetLoadingPanelTextLabel();
      if (textLabel)
        textLabel.innerHTML = this.isLoadingPanelTextEmpty ? "&nbsp;" : text;
    },
    SetContentHtml: function (html, useAnimation) {
      ASPxClientPanel.prototype.SetContentHtml.call(this, html);
      if (useAnimation && typeof ASPx.AnimationHelper != "undefined")
        ASPx.AnimationHelper.fadeIn(this.getContentElement());
    },
  });
  ASPxClientCallbackPanel.Cast = ASPxClientControl.Cast;
  window.ASPxClientCallbackPanel = ASPxClientCallbackPanel;
})();
(function () {
  var ASPxClientEditBase = ASPx.CreateClass(ASPxClientControl, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.EnabledChanged = new ASPxClientEvent();
      this.captionPosition = ASPx.Position.Left;
      this.showCaptionColon = true;
    },
    InlineInitialize: function () {
      ASPxClientControl.prototype.InlineInitialize.call(this);
      this.InitializeEnabled();
    },
    InitializeEnabled: function () {
      this.SetEnabledInternal(this.clientEnabled, true);
    },
    GetValue: function () {
      var element = this.GetMainElement();
      if (ASPx.IsExistsElement(element)) return element.innerHTML;
      return "";
    },
    GetValueString: function () {
      var value = this.GetValue();
      return value == null ? null : value.toString();
    },
    SetValue: function (value) {
      if (value == null) value = "";
      var element = this.GetMainElement();
      if (ASPx.IsExistsElement(element)) element.innerHTML = value;
    },
    GetEnabled: function () {
      return this.enabled && this.clientEnabled;
    },
    SetEnabled: function (enabled) {
      if (this.clientEnabled != enabled) {
        var errorFrameRequiresUpdate = this.GetIsValid && !this.GetIsValid();
        if (errorFrameRequiresUpdate && !enabled)
          this.UpdateErrorFrameAndFocus(false, null, true);
        this.clientEnabled = enabled;
        this.SetEnabledInternal(enabled, false);
        if (errorFrameRequiresUpdate && enabled)
          this.UpdateErrorFrameAndFocus(false);
        this.RaiseEnabledChangedEvent();
      }
    },
    SetEnabledInternal: function (enabled, initialization) {
      if (!this.enabled) return;
      if (!initialization || !enabled) this.ChangeEnabledStateItems(enabled);
      this.ChangeEnabledAttributes(enabled);
      if (ASPx.Browser.Chrome) {
        var mainElement = this.GetMainElement();
        if (mainElement) mainElement.className = mainElement.className;
      }
    },
    ChangeEnabledAttributes: function (enabled) {},
    ChangeEnabledStateItems: function (enabled) {},
    RaiseEnabledChangedEvent: function () {
      if (!this.EnabledChanged.IsEmpty()) {
        var args = new ASPxClientEventArgs();
        this.EnabledChanged.FireEvent(this, args);
      }
    },
    GetDecodeValue: function (value) {
      if (typeof value == "string" && value.length > 1)
        value = this.SimpleDecodeHtml(value);
      return value;
    },
    SimpleDecodeHtml: function (html) {
      return ASPx.Str.ApplyReplacement(html, [
        [/&lt;/g, "<"],
        [/&amp;/g, "&"],
        [/&quot;/g, '"'],
        [/&#39;/g, "'"],
        [/&#32;/g, " "],
      ]);
    },
    GetCachedElementById: function (idSuffix) {
      return ASPx.CacheHelper.GetCachedElementById(this, this.name + idSuffix);
    },
    GetCaptionCell: function () {
      return this.GetCachedElementById(EditElementSuffix.CaptionCell);
    },
    GetExternalTable: function () {
      return this.GetCachedElementById(EditElementSuffix.ExternalTable);
    },
    getCaptionRelatedCellCount: function () {
      if (!this.captionRelatedCellCount)
        this.captionRelatedCellCount = ASPx.GetNodesByClassName(
          this.GetExternalTable(),
          CaptionRelatedCellClassName
        ).length;
      return this.captionRelatedCellCount;
    },
    addCssClassToCaptionRelatedCells: function () {
      if (
        this.captionPosition == ASPx.Position.Left ||
        this.captionPosition == ASPx.Position.Right
      ) {
        var captionRelatedCellsIndex =
          this.captionPosition == ASPx.Position.Left
            ? 0
            : this.GetCaptionCell().cellIndex;
        for (var i = 0; i < this.GetExternalTable().rows.length; i++)
          ASPx.AddClassNameToElement(
            this.GetExternalTable().rows[i].cells[captionRelatedCellsIndex],
            CaptionRelatedCellClassName
          );
      }
      if (
        this.captionPosition == ASPx.Position.Top ||
        this.captionPosition == ASPx.Position.Bottom
      )
        for (var i = 0; i < this.GetCaptionCell().parentNode.cells.length; i++)
          ASPx.AddClassNameToElement(
            this.GetCaptionCell().parentNode.cells[i],
            CaptionRelatedCellClassName
          );
    },
    GetCaption: function () {
      if (ASPx.IsExists(this.GetCaptionCell()))
        return this.getCaptionInternal();
      return "";
    },
    SetCaption: function (caption) {
      if (!ASPx.IsExists(this.GetCaptionCell())) return;
      if (this.getCaptionRelatedCellCount() == 0)
        this.addCssClassToCaptionRelatedCells();
      if (caption !== "")
        ASPx.RemoveClassNameFromElement(
          this.GetExternalTable(),
          ASPxEditExternalTableClassNames.TableWithEmptyCaptionClassName
        );
      else
        ASPx.AddClassNameToElement(
          this.GetExternalTable(),
          ASPxEditExternalTableClassNames.TableWithEmptyCaptionClassName
        );
      this.setCaptionInternal(caption);
    },
    getCaptionTextNode: function () {
      var captionElement = ASPx.GetNodesByPartialClassName(
        this.GetCaptionCell(),
        CaptionElementPartialClassName
      )[0];
      return ASPx.GetTextNode(captionElement);
    },
    getCaptionInternal: function () {
      var captionText = this.getCaptionTextNode().nodeValue;
      if (captionText !== "" && captionText[captionText.length - 1] == ":")
        captionText = captionText.substring(0, captionText.length - 1);
      return captionText;
    },
    setCaptionInternal: function (caption) {
      caption = ASPx.Str.Trim(caption);
      var captionTextNode = this.getCaptionTextNode();
      if (
        this.showCaptionColon &&
        caption[caption.length - 1] != ":" &&
        caption !== ""
      )
        caption += ":";
      captionTextNode.nodeValue = caption;
    },
  });
  var ValidationPattern = ASPx.CreateClass(null, {
    constructor: function (errorText) {
      this.errorText = errorText;
    },
  });
  var RequiredFieldValidationPattern = ASPx.CreateClass(ValidationPattern, {
    constructor: function (errorText) {
      this.constructor.prototype.constructor.call(this, errorText);
    },
    EvaluateIsValid: function (value) {
      return (
        value != null &&
        (value.constructor == Array || ASPx.Str.Trim(value.toString()) != "")
      );
    },
  });
  var RegularExpressionValidationPattern = ASPx.CreateClass(ValidationPattern, {
    constructor: function (errorText, pattern) {
      this.constructor.prototype.constructor.call(this, errorText);
      this.pattern = pattern;
    },
    EvaluateIsValid: function (value) {
      if (value == null) return true;
      var strValue = value.toString();
      if (ASPx.Str.Trim(strValue).length == 0) return true;
      var regEx = new RegExp(this.pattern);
      var matches = regEx.exec(strValue);
      return matches != null && strValue == matches[0];
    },
  });
  function _aspxIsEditorFocusable(inputElement) {
    return ASPx.IsFocusableCore(inputElement, function (container) {
      return container.getAttribute("errorFrame") == "errorFrame";
    });
  }
  var invalidEditorToBeFocused = null;
  var ValidationType = {
    PersonalOnValueChanged: "ValueChanged",
    PersonalViaScript: "CalledViaScript",
    MassValidation: "MassValidation",
  };
  var ErrorFrameDisplay = {
    None: "None",
    Static: "Static",
    Dynamic: "Dynamic",
  };
  var EditElementSuffix = {
    ExternalTable: "_ET",
    ControlCell: "_CC",
    ErrorCell: "_EC",
    ErrorTextCell: "_ETC",
    ErrorImage: "_EI",
    CaptionCell: "_CapC",
  };
  var ASPxEditExternalTableClassNames = {
    ValidStaticTableClassName: "dxeValidStEditorTable",
    ValidDynamicTableClassName: "dxeValidDynEditorTable",
    TableWithSeparateBordersClassName: "tableWithSeparateBorders",
    TableWithEmptyCaptionClassName: "tableWithEmptyCaption",
  };
  var CaptionRelatedCellClassName = "dxeCaptionRelatedCell";
  var CaptionElementPartialClassName = "dxeCaption";
  var ASPxClientEdit = ASPx.CreateClass(ASPxClientEditBase, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.isASPxClientEdit = true;
      this.inputElement = null;
      this.convertEmptyStringToNull = true;
      this.readOnly = false;
      this.focused = false;
      this.focusEventsLocked = false;
      this.receiveGlobalMouseWheel = true;
      this.styleDecoration = null;
      this.heightCorrectionRequired = false;
      this.customValidationEnabled = false;
      this.display = ErrorFrameDisplay.Static;
      this.initialErrorText = "";
      this.causesValidation = false;
      this.validateOnLeave = true;
      this.validationGroup = "";
      this.sendPostBackWithValidation = null;
      this.validationPatterns = [];
      this.setFocusOnError = false;
      this.errorDisplayMode = "it";
      this.errorText = "";
      this.isValid = true;
      this.errorImageIsAssigned = false;
      this.notifyValidationSummariesToAcceptNewError = false;
      this.enterProcessed = false;
      this.keyDownHandlers = {};
      this.keyPressHandlers = {};
      this.keyUpHandlers = {};
      this.specialKeyboardHandlingUsed = false;
      this.onKeyDownHandler = null;
      this.onKeyPressHandler = null;
      this.onKeyUpHandler = null;
      this.onGotFocusHandler = null;
      this.onLostFocusHandler = null;
      this.GotFocus = new ASPxClientEvent();
      this.LostFocus = new ASPxClientEvent();
      this.Validation = new ASPxClientEvent();
      this.ValueChanged = new ASPxClientEvent();
      this.KeyDown = new ASPxClientEvent();
      this.KeyPress = new ASPxClientEvent();
      this.KeyUp = new ASPxClientEvent();
      this.eventHandlersInitialized = false;
    },
    Initialize: function () {
      this.initialErrorText = this.errorText;
      ASPxClientEditBase.prototype.Initialize.call(this);
      this.InitializeKeyHandlers();
      this.UpdateClientValidationState();
      this.UpdateValidationSummaries(null, true);
    },
    InlineInitialize: function () {
      ASPxClientEditBase.prototype.InlineInitialize.call(this);
      if (!this.eventHandlersInitialized) this.InitializeEvents();
      if (this.styleDecoration) this.styleDecoration.Update();
      var externalTable = this.GetExternalTable();
      if (externalTable && ASPx.IsPercentageSize(externalTable.style.width)) {
        this.width = "100%";
        this.GetMainElement().style.width = "100%";
      }
    },
    InitializeEvents: function () {},
    InitSpecialKeyboardHandling: function () {
      var name = this.name;
      this.onKeyDownHandler = function (evt) {
        ASPx.KBSIKeyDown(name, evt);
      };
      this.onKeyPressHandler = function (evt) {
        ASPx.KBSIKeyPress(name, evt);
      };
      this.onKeyUpHandler = function (evt) {
        ASPx.KBSIKeyUp(name, evt);
      };
      this.onGotFocusHandler = function (evt) {
        ASPx.ESGotFocus(name);
      };
      this.onLostFocusHandler = function (evt) {
        ASPx.ESLostFocus(name);
      };
      this.specialKeyboardHandlingUsed = true;
      this.InitializeDelayedSpecialFocus();
    },
    InitializeKeyHandlers: function () {},
    AddKeyDownHandler: function (key, handler) {
      this.keyDownHandlers[key] = handler;
    },
    AddKeyPressHandler: function (key, handler) {
      this.keyPressHandlers[key] = handler;
    },
    ChangeSpecialInputEnabledAttributes: function (
      element,
      method,
      doNotChangeAutoComplete
    ) {
      if (!doNotChangeAutoComplete) element.autocomplete = "off";
      if (this.onKeyDownHandler != null)
        method(element, "keydown", this.onKeyDownHandler);
      if (this.onKeyPressHandler != null)
        method(element, "keypress", this.onKeyPressHandler);
      if (this.onKeyUpHandler != null)
        method(element, "keyup", this.onKeyUpHandler);
      if (this.onGotFocusHandler != null)
        method(element, "focus", this.onGotFocusHandler);
      if (this.onLostFocusHandler != null)
        method(element, "blur", this.onLostFocusHandler);
    },
    UpdateClientValidationState: function () {
      if (!this.customValidationEnabled) return;
      var mainElement = this.GetMainElement();
      if (mainElement) {
        var validationState = !this.GetIsValid()
          ? "-" + this.GetErrorText()
          : "";
        this.UpdateStateObjectWithObject({ validationState: validationState });
      }
    },
    UpdateValidationSummaries: function (validationType, initializing) {
      if (typeof ASPxClientValidationSummary != "undefined") {
        var summaryCollection = ASPx.GetClientValidationSummaryCollection();
        summaryCollection.OnEditorIsValidStateChanged(
          this,
          validationType,
          initializing && this.notifyValidationSummariesToAcceptNewError
        );
      }
    },
    FindInputElement: function () {
      return null;
    },
    GetInputElement: function () {
      if (!ASPx.IsExistsElement(this.inputElement))
        this.inputElement = this.FindInputElement();
      return this.inputElement;
    },
    GetFocusableInputElement: function () {
      return this.GetInputElement();
    },
    GetErrorImage: function () {
      return this.GetCachedElementById(EditElementSuffix.ErrorImage);
    },
    GetControlCell: function () {
      return this.GetCachedElementById(EditElementSuffix.ControlCell);
    },
    GetErrorCell: function () {
      return this.GetCachedElementById(EditElementSuffix.ErrorCell);
    },
    GetErrorTextCell: function () {
      return this.GetCachedElementById(
        this.errorImageIsAssigned
          ? EditElementSuffix.ErrorTextCell
          : EditElementSuffix.ErrorCell
      );
    },
    SetVisible: function (isVisible) {
      if (this.clientVisible == isVisible) return;
      var externalTable = this.GetExternalTable();
      if (externalTable) {
        ASPx.SetElementDisplay(externalTable, isVisible);
        if (this.customValidationEnabled) {
          var isValid = !isVisible ? true : void 0;
          this.UpdateErrorFrameAndFocus(false, true, isValid);
        }
      }
      ASPxClientControl.prototype.SetVisible.call(this, isVisible);
    },
    GetStateHiddenFieldName: function () {
      return this.uniqueID + "$State";
    },
    GetValueInputToValidate: function () {
      return this.GetInputElement();
    },
    IsVisible: function () {
      if (!this.clientVisible) return false;
      var element = this.GetMainElement();
      if (!element) return false;
      while (element && element.tagName != "BODY") {
        if (
          element.getAttribute("errorFrame") != "errorFrame" &&
          (!ASPx.GetElementVisibility(element) ||
            !ASPx.GetElementDisplay(element))
        )
          return false;
        element = element.parentNode;
      }
      return true;
    },
    AdjustControlCore: function () {
      this.CollapseEditor();
      this.UnstretchInputElement();
      if (this.heightCorrectionRequired) this.CorrectEditorHeight();
    },
    CorrectEditorHeight: function () {},
    UnstretchInputElement: function () {},
    UseDelayedSpecialFocus: function () {
      return false;
    },
    GetDelayedSpecialFocusTriggers: function () {
      return [this.GetMainElement()];
    },
    InitializeDelayedSpecialFocus: function () {
      if (!this.UseDelayedSpecialFocus()) return;
      this.specialFocusTimer = -1;
      var handler = function (evt) {
        this.OnDelayedSpecialFocusMouseDown(evt);
      }.aspxBind(this);
      var triggers = this.GetDelayedSpecialFocusTriggers();
      for (var i = 0; i < triggers.length; i++)
        ASPx.Evt.AttachEventToElement(triggers[i], "mousedown", handler);
    },
    OnDelayedSpecialFocusMouseDown: function (evt) {
      window.setTimeout(
        function () {
          this.SetFocus();
        }.aspxBind(this),
        0
      );
    },
    IsFocusEventsLocked: function () {
      return this.focusEventsLocked;
    },
    LockFocusEvents: function () {
      if (!this.focused) return;
      this.focusEventsLocked = true;
    },
    UnlockFocusEvents: function () {
      this.focusEventsLocked = false;
    },
    ForceRefocusEditor: function (evt, isNativeFocus) {
      if (ASPx.Browser.VirtualKeyboardSupported) {
        var focusedEditor = ASPx.VirtualKeyboardUI.getFocusedEditor();
        if (
          ASPx.VirtualKeyboardUI.getInputNativeFocusLocked() &&
          (!focusedEditor || focusedEditor === this)
        )
          return;
        ASPx.VirtualKeyboardUI.setInputNativeFocusLocked(!isNativeFocus);
      }
      this.LockFocusEvents();
      this.BlurInputElement();
      window.setTimeout(
        function () {
          if (ASPx.Browser.VirtualKeyboardSupported) {
            ASPx.VirtualKeyboardUI.setFocusEditorCore(this);
          } else {
            this.SetFocus();
          }
        }.aspxBind(this),
        0
      );
    },
    BlurInputElement: function () {
      var inputElement = this.GetFocusableInputElement();
      if (inputElement && inputElement.blur) inputElement.blur();
    },
    IsEditorElement: function (element) {
      return (
        this.GetMainElement() == element ||
        ASPx.GetIsParent(this.GetMainElement(), element)
      );
    },
    IsClearButtonElement: function (element) {
      return false;
    },
    IsElementBelongToInputElement: function (element) {
      return this.GetInputElement() == element;
    },
    OnFocusCore: function () {
      if (this.UseDelayedSpecialFocus())
        window.clearTimeout(this.specialFocusTimer);
      if (!this.IsFocusEventsLocked()) {
        this.focused = true;
        ASPxClientEdit.SetFocusedEditor(this);
        if (this.styleDecoration) this.styleDecoration.Update();
        if (this.isInitialized) this.RaiseFocus();
      } else this.UnlockFocusEvents();
    },
    OnLostFocusCore: function () {
      if (!this.IsFocusEventsLocked()) {
        this.focused = false;
        if (
          !this.UseDelayedSpecialFocus() ||
          ASPxClientEdit.GetFocusedEditor() === this
        )
          ASPxClientEdit.SetFocusedEditor(null);
        if (this.styleDecoration) this.styleDecoration.Update();
        this.RaiseLostFocus();
      }
    },
    OnFocus: function () {
      if (!this.specialKeyboardHandlingUsed) this.OnFocusCore();
    },
    OnLostFocus: function () {
      if (this.isInitialized && !this.specialKeyboardHandlingUsed)
        this.OnLostFocusCore();
    },
    OnSpecialFocus: function () {
      if (this.isInitialized) this.OnFocusCore();
    },
    OnSpecialLostFocus: function () {
      if (this.isInitialized) this.OnLostFocusCore();
    },
    OnMouseWheel: function (evt) {},
    OnValidation: function (validationType) {
      if (
        this.customValidationEnabled &&
        this.isInitialized &&
        ASPx.IsExistsElement(this.GetMainElement()) &&
        (!this.IsErrorFrameDisplayed() || this.GetExternalTable())
      ) {
        this.BeginErrorFrameUpdate();
        try {
          if (
            this.validateOnLeave ||
            validationType != ValidationType.PersonalOnValueChanged
          ) {
            this.SetIsValid(true, true);
            this.SetErrorText(this.initialErrorText, true);
            this.ValidateWithPatterns();
            this.RaiseValidation();
          }
          this.UpdateErrorFrameAndFocus(
            this.editorFocusingRequired(validationType)
          );
        } finally {
          this.EndErrorFrameUpdate();
        }
        this.UpdateValidationSummaries(validationType);
      }
    },
    editorFocusingRequired: function (validationType) {
      return (
        !this.GetIsValid() &&
        ((validationType == ValidationType.PersonalOnValueChanged &&
          this.validateOnLeave) ||
          (validationType == ValidationType.PersonalViaScript &&
            this.setFocusOnError))
      );
    },
    OnValueChanged: function () {
      var processOnServer = this.RaiseValidationInternal();
      processOnServer = this.RaiseValueChangedEvent() && processOnServer;
      if (processOnServer) this.SendPostBackInternal("");
    },
    ParseValue: function () {},
    RaisePersonalStandardValidation: function () {
      if (ASPx.IsFunction(window.ValidatorOnChange)) {
        var inputElement = this.GetValueInputToValidate();
        if (inputElement && inputElement.Validators)
          window.ValidatorOnChange({ srcElement: inputElement });
      }
    },
    RaiseValidationInternal: function () {
      if (
        this.isPostBackAllowed() &&
        this.causesValidation &&
        this.validateOnLeave
      )
        return ASPxClientEdit.ValidateGroup(this.validationGroup);
      else {
        this.OnValidation(ValidationType.PersonalOnValueChanged);
        return this.GetIsValid();
      }
    },
    RaiseValueChangedEvent: function () {
      return this.RaiseValueChanged();
    },
    SendPostBackInternal: function (postBackArg) {
      if (ASPx.IsFunction(this.sendPostBackWithValidation))
        this.sendPostBackWithValidation(postBackArg);
      else this.SendPostBack(postBackArg);
    },
    SetElementToBeFocused: function () {
      if (this.IsVisible()) invalidEditorToBeFocused = this;
    },
    GetFocusSelectAction: function () {
      return null;
    },
    SetFocus: function () {
      var inputElement = this.GetFocusableInputElement();
      if (!inputElement) return;
      var isIE9 = ASPx.Browser.IE && ASPx.Browser.Version >= 9;
      if (
        (ASPx.GetActiveElement() != inputElement || isIE9) &&
        _aspxIsEditorFocusable(inputElement)
      )
        ASPx.SetFocus(inputElement, this.GetFocusSelectAction());
    },
    SetFocusOnError: function () {
      if (invalidEditorToBeFocused == this) {
        this.SetFocus();
        invalidEditorToBeFocused = null;
      }
    },
    BeginErrorFrameUpdate: function () {
      if (!this.errorFrameUpdateLocked) this.errorFrameUpdateLocked = true;
    },
    EndErrorFrameUpdate: function () {
      this.errorFrameUpdateLocked = false;
      var args = this.updateErrorFrameAndFocusLastCallArgs;
      if (args) {
        this.UpdateErrorFrameAndFocus(args[0], args[1]);
        delete this.updateErrorFrameAndFocusLastCallArgs;
      }
    },
    UpdateErrorFrameAndFocus: function (
      setFocusOnError,
      ignoreVisibilityCheck,
      isValid
    ) {
      if (!this.GetEnabled() || (!ignoreVisibilityCheck && !this.GetVisible()))
        return;
      if (this.errorFrameUpdateLocked) {
        this.updateErrorFrameAndFocusLastCallArgs = [
          setFocusOnError,
          ignoreVisibilityCheck,
        ];
        return;
      }
      if (this.styleDecoration) this.styleDecoration.Update();
      if (typeof isValid == "undefined") isValid = this.GetIsValid();
      var externalTable = this.GetExternalTable();
      var isStaticDisplay = this.display == ErrorFrameDisplay.Static;
      if (isValid && this.IsErrorFrameDisplayed()) {
        if (isStaticDisplay) {
          this.HideErrorCell(true);
          ASPx.AddClassNameToElement(
            externalTable,
            ASPxEditExternalTableClassNames.ValidStaticTableClassName
          );
        } else {
          this.HideErrorCell();
          this.SaveControlCellStyles();
          this.ClearControlCellStyles();
          ASPx.AddClassNameToElement(
            externalTable,
            ASPxEditExternalTableClassNames.ValidDynamicTableClassName
          );
        }
      } else {
        var editorLocatedWithinVisibleContainer = this.IsVisible();
        if (this.IsErrorFrameDisplayed()) {
          this.UpdateErrorCellContent();
          if (isStaticDisplay) {
            this.ShowErrorCell(true);
            ASPx.RemoveClassNameFromElement(
              externalTable,
              ASPxEditExternalTableClassNames.ValidStaticTableClassName
            );
          } else {
            this.EnsureControlCellStylesLoaded();
            this.RestoreControlCellStyles();
            this.ShowErrorCell();
            ASPx.RemoveClassNameFromElement(
              externalTable,
              ASPxEditExternalTableClassNames.ValidDynamicTableClassName
            );
          }
        }
        if (editorLocatedWithinVisibleContainer) {
          if (
            setFocusOnError &&
            this.setFocusOnError &&
            invalidEditorToBeFocused == null
          ) {
            this.SetElementToBeFocused();
            this.SetFocusOnError();
          }
        }
      }
    },
    ShowErrorCell: function (useVisibilityAttribute) {
      var errorCell = this.GetErrorCell();
      if (errorCell) {
        if (useVisibilityAttribute) ASPx.SetElementVisibility(errorCell, true);
        else ASPx.SetElementDisplay(errorCell, true);
      }
    },
    HideErrorCell: function (useVisibilityAttribute) {
      var errorCell = this.GetErrorCell();
      if (errorCell) {
        if (useVisibilityAttribute) ASPx.SetElementVisibility(errorCell, false);
        else ASPx.SetElementDisplay(errorCell, false);
      }
    },
    SaveControlCellStyles: function () {
      this.EnsureControlCellStylesLoaded();
    },
    EnsureControlCellStylesLoaded: function () {
      if (typeof this.controlCellStyles == "undefined") {
        var controlCell = this.GetControlCell();
        this.controlCellStyles = {
          cssClass: controlCell.className,
          style:
            this.ExtractElementStyleStringIgnoringVisibilityProps(controlCell),
        };
      }
    },
    ClearControlCellStyles: function () {
      this.ClearElementStyle(this.GetControlCell());
    },
    RestoreControlCellStyles: function () {
      var controlCell = this.GetControlCell();
      var externalTable = this.GetExternalTable();
      if (ASPx.Browser.WebKitFamily)
        this.MakeBorderSeparateForTable(externalTable);
      controlCell.className = this.controlCellStyles.cssClass;
      controlCell.style.cssText = this.controlCellStyles.style;
      if (ASPx.Browser.WebKitFamily)
        this.UndoBorderSeparateForTable(externalTable);
    },
    MakeBorderSeparateForTable: function (table) {
      ASPx.AddClassNameToElement(
        table,
        ASPxEditExternalTableClassNames.TableWithSeparateBordersClassName
      );
    },
    UndoBorderSeparateForTable: function (table) {
      setTimeout(function () {
        ASPx.RemoveClassNameFromElement(
          table,
          ASPxEditExternalTableClassNames.TableWithSeparateBordersClassName
        );
      }, 0);
    },
    ExtractElementStyleStringIgnoringVisibilityProps: function (element) {
      var savedVisibility = element.style.visibility;
      var savedDisplay = element.style.display;
      element.style.visibility = "";
      element.style.display = "";
      var styleStr = element.style.cssText;
      element.style.visibility = savedVisibility;
      element.style.display = savedDisplay;
      return styleStr;
    },
    ClearElementStyle: function (element) {
      if (!element) return;
      element.className = "";
      var excludedAttrNames = [
        "width",
        "display",
        "visibility",
        "position",
        "left",
        "top",
        "z-index",
        "margin",
        "margin-top",
        "margin-right",
        "margin-bottom",
        "margin-left",
        "float",
        "clear",
      ];
      var savedAttrValues = {};
      for (var i = 0; i < excludedAttrNames.length; i++) {
        var attrName = excludedAttrNames[i];
        var attrValue = element.style[attrName];
        if (attrValue) savedAttrValues[attrName] = attrValue;
      }
      element.style.cssText = "";
      for (var styleAttrName in savedAttrValues)
        element.style[styleAttrName] = savedAttrValues[styleAttrName];
    },
    Clear: function () {
      this.SetValue(null);
      this.SetIsValid(true);
      return true;
    },
    UpdateErrorCellContent: function () {
      if (this.errorDisplayMode.indexOf("t") > -1) this.UpdateErrorText();
      if (this.errorDisplayMode == "i") this.UpdateErrorImage();
    },
    UpdateErrorImage: function () {
      var image = this.GetErrorImage();
      if (ASPx.IsExistsElement(image)) {
        image.alt = this.errorText;
        image.title = this.errorText;
      } else {
        this.UpdateErrorText();
      }
    },
    UpdateErrorText: function () {
      var errorTextCell = this.GetErrorTextCell();
      if (ASPx.IsExistsElement(errorTextCell))
        errorTextCell.innerHTML = this.HtmlEncode(this.errorText);
    },
    ValidateWithPatterns: function () {
      if (this.validationPatterns.length > 0) {
        var value = this.GetValue();
        for (var i = 0; i < this.validationPatterns.length; i++) {
          var validator = this.validationPatterns[i];
          if (!validator.EvaluateIsValid(value)) {
            this.SetIsValid(false, true);
            this.SetErrorText(validator.errorText, true);
            return;
          }
        }
      }
    },
    OnSpecialKeyDown: function (evt) {
      this.RaiseKeyDown(evt);
      var handler = this.keyDownHandlers[evt.keyCode];
      if (handler) return this[handler](evt);
      return false;
    },
    OnSpecialKeyPress: function (evt) {
      this.RaiseKeyPress(evt);
      var handler = this.keyPressHandlers[evt.keyCode];
      if (handler) return this[handler](evt);
      if (ASPx.Browser.NetscapeFamily || ASPx.Browser.Opera) {
        if (evt.keyCode == ASPx.Key.Enter) return this.enterProcessed;
      }
      return false;
    },
    OnSpecialKeyUp: function (evt) {
      this.RaiseKeyUp(evt);
      var handler = this.keyUpHandlers[evt.keyCode];
      if (handler) return this[handler](evt);
      return false;
    },
    OnKeyDown: function (evt) {
      if (!this.specialKeyboardHandlingUsed) this.RaiseKeyDown(evt);
    },
    OnKeyPress: function (evt) {
      if (!this.specialKeyboardHandlingUsed) this.RaiseKeyPress(evt);
    },
    OnKeyUp: function (evt) {
      if (!this.specialKeyboardHandlingUsed) this.RaiseKeyUp(evt);
    },
    RaiseKeyDown: function (evt) {
      if (!this.KeyDown.IsEmpty()) {
        var args = new ASPxClientEditKeyEventArgs(evt);
        this.KeyDown.FireEvent(this, args);
      }
    },
    RaiseKeyPress: function (evt) {
      if (!this.KeyPress.IsEmpty()) {
        var args = new ASPxClientEditKeyEventArgs(evt);
        this.KeyPress.FireEvent(this, args);
      }
    },
    RaiseKeyUp: function (evt) {
      if (!this.KeyUp.IsEmpty()) {
        var args = new ASPxClientEditKeyEventArgs(evt);
        this.KeyUp.FireEvent(this, args);
      }
    },
    RaiseFocus: function () {
      if (!this.GotFocus.IsEmpty()) {
        var args = new ASPxClientEventArgs();
        this.GotFocus.FireEvent(this, args);
      }
    },
    RaiseLostFocus: function () {
      if (!this.LostFocus.IsEmpty()) {
        var args = new ASPxClientEventArgs();
        this.LostFocus.FireEvent(this, args);
      }
    },
    RaiseValidation: function () {
      if (this.customValidationEnabled && !this.Validation.IsEmpty()) {
        var currentValue = this.GetValue();
        var args = new ASPxClientEditValidationEventArgs(
          currentValue,
          this.errorText,
          this.GetIsValid()
        );
        this.Validation.FireEvent(this, args);
        this.SetErrorText(args.errorText, true);
        this.SetIsValid(args.isValid, true);
        if (args.value != currentValue) this.SetValue(args.value);
      }
    },
    RaiseValueChanged: function () {
      var processOnServer = this.isPostBackAllowed();
      if (!this.ValueChanged.IsEmpty()) {
        var args = new ASPxClientProcessingModeEventArgs(processOnServer);
        this.ValueChanged.FireEvent(this, args);
        processOnServer = args.processOnServer;
      }
      return processOnServer;
    },
    isPostBackAllowed: function () {
      return this.autoPostBack;
    },
    RequireStyleDecoration: function () {
      this.styleDecoration = new ASPx.EditorStyleDecoration(this);
      this.PopulateStyleDecorationPostfixes();
    },
    PopulateStyleDecorationPostfixes: function () {
      this.styleDecoration.AddPostfix("");
    },
    Focus: function () {
      this.SetFocus();
    },
    GetIsValid: function () {
      var hasRequiredInputElement =
        !this.RequireInputElementToValidate() ||
        ASPx.IsExistsElement(this.GetInputElement());
      if (
        !hasRequiredInputElement ||
        (this.IsErrorFrameDisplayed() &&
          !ASPx.IsExistsElement(this.GetExternalTable()))
      )
        return true;
      return this.isValid;
    },
    RequireInputElementToValidate: function () {
      return true;
    },
    IsErrorFrameDisplayed: function () {
      return this.display !== ErrorFrameDisplay.None;
    },
    GetErrorText: function () {
      return this.errorText;
    },
    SetIsValid: function (isValid, validating) {
      if (this.customValidationEnabled && this.isValid != isValid) {
        this.isValid = isValid;
        this.UpdateErrorFrameAndFocus(false);
        this.UpdateClientValidationState();
        if (!validating)
          this.UpdateValidationSummaries(ValidationType.PersonalViaScript);
      }
    },
    SetErrorText: function (errorText, validating) {
      if (this.customValidationEnabled && this.errorText != errorText) {
        this.errorText = errorText;
        this.UpdateErrorFrameAndFocus(false);
        this.UpdateClientValidationState();
        if (!validating)
          this.UpdateValidationSummaries(ValidationType.PersonalViaScript);
      }
    },
    Validate: function () {
      this.ParseValue();
      this.OnValidation(ValidationType.PersonalViaScript);
    },
  });
  var focusedEditorName = "";
  ASPxClientEdit.GetFocusedEditor = function () {
    var focusedEditor = ASPx.GetControlCollection().Get(focusedEditorName);
    if (focusedEditor && !focusedEditor.focused) {
      ASPxClientEdit.SetFocusedEditor(null);
      focusedEditor = null;
    }
    return focusedEditor;
  };
  ASPxClientEdit.SetFocusedEditor = function (editor) {
    focusedEditorName = editor ? editor.name : "";
  };
  ASPxClientEdit.ClearEditorsInContainer = function (
    container,
    validationGroup,
    clearInvisibleEditors
  ) {
    invalidEditorToBeFocused = null;
    ASPx.ProcessEditorsInContainer(
      container,
      ASPx.ClearProcessingProc,
      ASPx.ClearChoiceCondition,
      validationGroup,
      clearInvisibleEditors,
      true
    );
    ASPxClientEdit.ClearExternalControlsInContainer(
      container,
      validationGroup,
      clearInvisibleEditors
    );
  };
  ASPxClientEdit.ClearEditorsInContainerById = function (
    containerId,
    validationGroup,
    clearInvisibleEditors
  ) {
    var container = document.getElementById(containerId);
    this.ClearEditorsInContainer(
      container,
      validationGroup,
      clearInvisibleEditors
    );
  };
  ASPxClientEdit.ClearGroup = function (
    validationGroup,
    clearInvisibleEditors
  ) {
    return this.ClearEditorsInContainer(
      null,
      validationGroup,
      clearInvisibleEditors
    );
  };
  ASPxClientEdit.ValidateEditorsInContainer = function (
    container,
    validationGroup,
    validateInvisibleEditors
  ) {
    var summaryCollection;
    if (typeof ASPxClientValidationSummary != "undefined") {
      summaryCollection = ASPx.GetClientValidationSummaryCollection();
      summaryCollection.AllowNewErrorsAccepting(validationGroup);
    }
    var validationResult = ASPx.ProcessEditorsInContainer(
      container,
      ASPx.ValidateProcessingProc,
      _aspxValidateChoiceCondition,
      validationGroup,
      validateInvisibleEditors,
      false
    );
    validationResult.isValid =
      ASPxClientEdit.ValidateExternalControlsInContainer(
        container,
        validationGroup,
        validateInvisibleEditors
      ) && validationResult.isValid;
    if (typeof validateInvisibleEditors == "undefined")
      validateInvisibleEditors = false;
    if (typeof validationGroup == "undefined") validationGroup = null;
    ASPx.GetControlCollection().RaiseValidationCompleted(
      container,
      validationGroup,
      validateInvisibleEditors,
      validationResult.isValid,
      validationResult.firstInvalid,
      validationResult.firstVisibleInvalid
    );
    if (summaryCollection)
      summaryCollection.ForbidNewErrorsAccepting(validationGroup);
    return validationResult.isValid;
  };
  ASPxClientEdit.ValidateEditorsInContainerById = function (
    containerId,
    validationGroup,
    validateInvisibleEditors
  ) {
    var container = document.getElementById(containerId);
    return this.ValidateEditorsInContainer(
      container,
      validationGroup,
      validateInvisibleEditors
    );
  };
  ASPxClientEdit.ValidateGroup = function (
    validationGroup,
    validateInvisibleEditors
  ) {
    return this.ValidateEditorsInContainer(
      null,
      validationGroup,
      validateInvisibleEditors
    );
  };
  ASPxClientEdit.AreEditorsValid = function (
    containerOrContainerId,
    validationGroup,
    checkInvisibleEditors
  ) {
    var container =
      typeof containerOrContainerId == "string"
        ? document.getElementById(containerOrContainerId)
        : containerOrContainerId;
    var checkResult = ASPx.ProcessEditorsInContainer(
      container,
      ASPx.EditorsValidProcessingProc,
      _aspxEditorsValidChoiceCondition,
      validationGroup,
      checkInvisibleEditors,
      false
    );
    checkResult.isValid =
      ASPxClientEdit.AreExternalControlsValidInContainer(
        containerOrContainerId,
        validationGroup,
        checkInvisibleEditors
      ) && checkResult.isValid;
    return checkResult.isValid;
  };
  ASPxClientEdit.AreExternalControlsValidInContainer = function (
    containerId,
    validationGroup,
    validateInvisibleEditors
  ) {
    if (typeof ASPxClientHtmlEditor != "undefined")
      return ASPxClientHtmlEditor.AreEditorsValidInContainer(
        containerId,
        validationGroup,
        validateInvisibleEditors
      );
    return true;
  };
  ASPxClientEdit.ClearExternalControlsInContainer = function (
    containerId,
    validationGroup,
    validateInvisibleEditors
  ) {
    if (typeof ASPxClientHtmlEditor != "undefined")
      return ASPxClientHtmlEditor.ClearEditorsInContainer(
        containerId,
        validationGroup,
        validateInvisibleEditors
      );
    return true;
  };
  ASPxClientEdit.ValidateExternalControlsInContainer = function (
    containerId,
    validationGroup,
    validateInvisibleEditors
  ) {
    if (typeof ASPxClientHtmlEditor != "undefined")
      return ASPxClientHtmlEditor.ValidateEditorsInContainer(
        containerId,
        validationGroup,
        validateInvisibleEditors
      );
    return true;
  };
  var ASPxClientEditKeyEventArgs = ASPx.CreateClass(ASPxClientEventArgs, {
    constructor: function (htmlEvent) {
      this.constructor.prototype.constructor.call(this);
      this.htmlEvent = htmlEvent;
    },
  });
  var ASPxClientEditValidationEventArgs = ASPx.CreateClass(
    ASPxClientEventArgs,
    {
      constructor: function (value, errorText, isValid) {
        this.constructor.prototype.constructor.call(this);
        this.errorText = errorText;
        this.isValid = isValid;
        this.value = value;
      },
    }
  );
  ASPx.ProcessEditorsInContainer = function (
    container,
    processingProc,
    choiceCondition,
    validationGroup,
    processInvisibleEditors,
    processDisabledEditors
  ) {
    var allProcessedSuccessfull = true;
    var firstInvalid = null;
    var firstVisibleInvalid = null;
    var invalidEditorToBeFocused = null;
    ASPx.GetControlCollection().ForEachControl(function (control) {
      var needToProcessRatingControl =
        window.ASPxClientRatingControl &&
        control instanceof ASPxClientRatingControl &&
        processingProc === ASPx.ClearProcessingProc;
      if (
        !ASPx.Ident.isDialogInvisibleControl(control) &&
        (ASPx.Ident.IsASPxClientEdit(control) || needToProcessRatingControl) &&
        (processDisabledEditors || control.GetEnabled())
      ) {
        var mainElement = control.GetMainElement();
        if (
          mainElement &&
          (container == null || ASPx.GetIsParent(container, mainElement)) &&
          (processInvisibleEditors || control.IsVisible()) &&
          choiceCondition(control, validationGroup)
        ) {
          var isSuccess = processingProc(control);
          if (!isSuccess) {
            allProcessedSuccessfull = false;
            if (firstInvalid == null) firstInvalid = control;
            var isVisible = control.IsVisible();
            if (isVisible && firstVisibleInvalid == null)
              firstVisibleInvalid = control;
            if (
              control.setFocusOnError &&
              invalidEditorToBeFocused == null &&
              isVisible
            )
              invalidEditorToBeFocused = control;
          }
        }
      }
    }, this);
    if (invalidEditorToBeFocused != null) invalidEditorToBeFocused.SetFocus();
    return new ASPxValidationResult(
      allProcessedSuccessfull,
      firstInvalid,
      firstVisibleInvalid
    );
  };
  var ASPxValidationResult = ASPx.CreateClass(null, {
    constructor: function (isValid, firstInvalid, firstVisibleInvalid) {
      this.isValid = isValid;
      this.firstInvalid = firstInvalid;
      this.firstVisibleInvalid = firstVisibleInvalid;
    },
  });
  ASPx.ClearChoiceCondition = function (edit, validationGroup) {
    return (
      !ASPx.IsExists(validationGroup) || edit.validationGroup == validationGroup
    );
  };
  function _aspxValidateChoiceCondition(edit, validationGroup) {
    return (
      ASPx.ClearChoiceCondition(edit, validationGroup) &&
      edit.customValidationEnabled
    );
  }
  function _aspxEditorsValidChoiceCondition(edit, validationGroup) {
    return _aspxValidateChoiceCondition(edit, validationGroup);
  }
  function wrapLostFocusHandler(handler) {
    if (ASPx.Browser.Edge) {
      return function (name) {
        var edit = ASPx.GetControlCollection().Get(name);
        if (edit && !ASPx.IsElementVisible(edit.GetMainElement()))
          setTimeout(handler, 0, name);
        else handler(name);
      };
    }
    return handler;
  }
  ASPx.EGotFocus = function (name) {
    var edit = ASPx.GetControlCollection().Get(name);
    if (!edit) return;
    if (!edit.isInitialized) {
      var inputElement = edit.GetFocusableInputElement();
      if (inputElement && inputElement === document.activeElement)
        ASPx.Browser.Firefox
          ? window.setTimeout(function () {
              document.activeElement.blur();
            }, 0)
          : document.activeElement.blur();
      return;
    }
    if (ASPx.Browser.VirtualKeyboardSupported) {
      ASPx.VirtualKeyboardUI.onCallingVirtualKeyboard(edit, false);
    } else {
      edit.OnFocus();
    }
  };
  ASPx.ELostFocusCore = function (name) {
    if (ASPx.Browser.VirtualKeyboardSupported) {
      var supressLostFocus = ASPx.VirtualKeyboardUI.isInputNativeBluring();
      if (supressLostFocus) return;
      ASPx.VirtualKeyboardUI.resetFocusedEditor();
    }
    var edit = ASPx.GetControlCollection().Get(name);
    if (edit != null) edit.OnLostFocus();
  };
  ASPx.ELostFocus = wrapLostFocusHandler(ASPx.ELostFocusCore);
  ASPx.ESGotFocus = function (name) {
    var edit = ASPx.GetControlCollection().Get(name);
    if (!edit) return;
    if (ASPx.Browser.VirtualKeyboardSupported) {
      ASPx.VirtualKeyboardUI.onCallingVirtualKeyboard(edit, true);
    } else {
      edit.OnSpecialFocus();
    }
  };
  ASPx.ESLostFocusCore = function (name) {
    if (ASPx.Browser.VirtualKeyboardSupported) {
      var supressLostFocus = ASPx.VirtualKeyboardUI.isInputNativeBluring();
      if (supressLostFocus) return;
      ASPx.VirtualKeyboardUI.resetFocusedEditor();
    }
    var edit = ASPx.GetControlCollection().Get(name);
    if (!edit) return;
    if (edit.UseDelayedSpecialFocus())
      edit.specialFocusTimer = window.setTimeout(function () {
        edit.OnSpecialLostFocus();
      }, 30);
    else edit.OnSpecialLostFocus();
  };
  ASPx.ESLostFocus = wrapLostFocusHandler(ASPx.ESLostFocusCore);
  ASPx.EValueChanged = function (name) {
    var edit = ASPx.GetControlCollection().Get(name);
    if (edit != null) edit.OnValueChanged();
  };
  ASPx.VirtualKeyboardUI = (function () {
    var focusedEditor = null;
    var inputNativeFocusLocked = false;
    function elementBelongsToEditor(element) {
      if (!element) return false;
      var isBelongsToEditor = false;
      ASPx.GetControlCollection().ForEachControl(function (control) {
        if (
          ASPx.Ident.IsASPxClientEdit(control) &&
          control.IsEditorElement(element)
        ) {
          isBelongsToEditor = true;
          return true;
        }
      }, this);
      return isBelongsToEditor;
    }
    function elementBelongsToFocusedEditor(element) {
      return focusedEditor && focusedEditor.IsEditorElement(element);
    }
    return {
      onTouchStart: function (evt) {
        if (!ASPx.Browser.VirtualKeyboardSupported) return;
        inputNativeFocusLocked = false;
        if (ASPx.TouchUIHelper.pointerEnabled) {
          if (evt.pointerType != "touch") return;
          this.processFocusEditorControl(evt);
        } else
          ASPx.TouchUIHelper.handleFastTapIfRequired(
            evt,
            function () {
              this.processFocusEditorControl(evt);
            }.aspxBind(this),
            false
          );
      },
      processFocusEditorControl: function (evt) {
        var evtSource = ASPx.Evt.GetEventSource(evt);
        var timeEditHasAppliedFocus =
          focusedEditor &&
          ASPx.Ident.IsASPxClientTimeEdit &&
          ASPx.Ident.IsASPxClientTimeEdit(focusedEditor);
        var focusedTimeEditBelongsToDateEdit =
          timeEditHasAppliedFocus &&
          focusedEditor.OwnerDateEdit &&
          focusedEditor.OwnerDateEdit.GetShowTimeSection();
        if (focusedTimeEditBelongsToDateEdit) {
          focusedEditor.OwnerDateEdit.ForceRefocusTimeSectionTimeEdit(
            evtSource
          );
          return;
        }
        var elementWithNativeFocus = ASPx.GetActiveElement();
        var someEditorInputIsFocused = elementBelongsToEditor(
          elementWithNativeFocus
        );
        var touchKeyboardIsVisible = someEditorInputIsFocused;
        var tapOutsideEditorAndInputs =
          !elementBelongsToEditor(evtSource) &&
          !ASPx.Ident.IsFocusableElementRegardlessTabIndex(evtSource);
        var blurToHideTouchKeyboard =
          touchKeyboardIsVisible && tapOutsideEditorAndInputs;
        if (blurToHideTouchKeyboard) {
          elementWithNativeFocus.blur();
          return;
        }
        var tapOutsideFocusedEditor =
          focusedEditor && !elementBelongsToFocusedEditor(evtSource);
        if (tapOutsideFocusedEditor) {
          var focusedEditorWithBluredInput = !elementBelongsToFocusedEditor(
            elementWithNativeFocus
          );
          if (focusedEditorWithBluredInput) this.lostAppliedFocusOfEditor();
        }
      },
      smartFocusEditor: function (edit) {
        if (!edit.focused) {
          this.setInputNativeFocusLocked(true);
          this.setFocusEditorCore(edit);
        } else {
          edit.ForceRefocusEditor();
        }
      },
      setFocusEditorCore: function (edit) {
        if (ASPx.Browser.MacOSMobilePlatform) {
          var timeoutDuration = ASPx.Browser.Chrome ? 250 : 30;
          window.setTimeout(function () {
            edit.SetFocus();
          }, timeoutDuration);
        } else {
          edit.SetFocus();
        }
      },
      onCallingVirtualKeyboard: function (edit, isSpecial) {
        this.setAppliedFocusOfEditor(edit, isSpecial);
        if (
          edit.specialKeyboardHandlingUsed == isSpecial &&
          inputNativeFocusLocked
        )
          edit.BlurInputElement();
      },
      isInputNativeBluring: function () {
        return focusedEditor && inputNativeFocusLocked;
      },
      setInputNativeFocusLocked: function (locked) {
        inputNativeFocusLocked = locked;
      },
      getInputNativeFocusLocked: function () {
        return inputNativeFocusLocked;
      },
      setAppliedFocusOfEditor: function (edit, isSpecial) {
        if (focusedEditor === edit) {
          if (edit.specialKeyboardHandlingUsed == isSpecial) {
            focusedEditor.UnlockFocusEvents();
            if (focusedEditor.EnsureClearButtonVisibility)
              focusedEditor.EnsureClearButtonVisibility();
          }
          return;
        }
        if (edit.specialKeyboardHandlingUsed == isSpecial) {
          this.lostAppliedFocusOfEditor();
          focusedEditor = edit;
          ASPxClientEdit.SetFocusedEditor(edit);
        }
        if (isSpecial) edit.OnSpecialFocus();
        else edit.OnFocus();
      },
      lostAppliedFocusOfEditor: function () {
        if (!focusedEditor) return;
        var curEditorName = focusedEditor.name;
        var skbdHandlingUsed = focusedEditor.specialKeyboardHandlingUsed;
        var focusedEditorInputElementExists = focusedEditor.GetInputElement();
        focusedEditor = null;
        if (!focusedEditorInputElementExists) return;
        ASPx.ELostFocusCore(curEditorName);
        if (skbdHandlingUsed) ASPx.ESLostFocusCore(curEditorName);
      },
      getFocusedEditor: function () {
        return focusedEditor;
      },
      resetFocusedEditor: function () {
        focusedEditor = null;
      },
      focusableInputElementIsActive: function (edit) {
        var inputElement = edit.GetFocusableInputElement();
        return !!inputElement
          ? ASPx.GetActiveElement() === inputElement
          : false;
      },
    };
  })();
  if (ASPx.Browser.VirtualKeyboardSupported) {
    var touchEventName = ASPx.TouchUIHelper.pointerEnabled
      ? ASPx.TouchUIHelper.pointerDownEventName
      : "touchstart";
    ASPx.Evt.AttachEventToDocument(touchEventName, function (evt) {
      ASPx.VirtualKeyboardUI.onTouchStart(evt);
    });
  }
  ASPx.Evt.AttachEventToDocument("mousedown", function (evt) {
    var editor = ASPxClientEdit.GetFocusedEditor();
    if (!editor) return;
    var evtSource = ASPx.Evt.GetEventSource(evt);
    if (editor.IsClearButtonElement(evtSource)) return;
    if (editor.OwnerDateEdit && editor.OwnerDateEdit.GetShowTimeSection()) {
      editor.OwnerDateEdit.ForceRefocusTimeSectionTimeEdit(evtSource);
      return;
    }
    if (
      editor.IsEditorElement(evtSource) &&
      !editor.IsElementBelongToInputElement(evtSource)
    )
      editor.ForceRefocusEditor(evt);
  });
  ASPx.Evt.AttachEventToDocument(
    ASPx.Evt.GetMouseWheelEventName(),
    function (evt) {
      var editor = ASPxClientEdit.GetFocusedEditor();
      if (
        editor != null &&
        ASPx.IsExistsElement(editor.GetMainElement()) &&
        editor.focused &&
        editor.receiveGlobalMouseWheel
      )
        editor.OnMouseWheel(evt);
    }
  );
  ASPx.KBSIKeyDown = function (name, evt) {
    var control = ASPx.GetControlCollection().Get(name);
    if (control != null) {
      var isProcessed = control.OnSpecialKeyDown(evt);
      if (isProcessed) return ASPx.Evt.PreventEventAndBubble(evt);
    }
  };
  ASPx.KBSIKeyPress = function (name, evt) {
    var control = ASPx.GetControlCollection().Get(name);
    if (control != null) {
      var isProcessed = control.OnSpecialKeyPress(evt);
      if (isProcessed) return ASPx.Evt.PreventEventAndBubble(evt);
    }
  };
  ASPx.KBSIKeyUp = function (name, evt) {
    var control = ASPx.GetControlCollection().Get(name);
    if (control != null) {
      var isProcessed = control.OnSpecialKeyUp(evt);
      if (isProcessed) return ASPx.Evt.PreventEventAndBubble(evt);
    }
  };
  ASPx.ClearProcessingProc = function (edit) {
    return edit.Clear();
  };
  ASPx.ValidateProcessingProc = function (edit) {
    edit.OnValidation(ValidationType.MassValidation);
    return edit.GetIsValid();
  };
  ASPx.EditorsValidProcessingProc = function (edit) {
    return edit.GetIsValid();
  };
  var CheckEditElementHelper = ASPx.CreateClass(ASPx.CheckableElementHelper, {
    AttachToMainElement: function (internalCheckBox) {
      ASPx.CheckableElementHelper.prototype.AttachToMainElement.call(
        this,
        internalCheckBox
      );
      this.AttachToLabelElement(
        this.GetLabelElement(internalCheckBox.container),
        internalCheckBox
      );
    },
    AttachToLabelElement: function (labelElement, internalCheckBox) {
      var _this = this;
      if (labelElement) {
        ASPx.Evt.AttachEventToElement(labelElement, "click", function (evt) {
          _this.InvokeClick(internalCheckBox, evt);
        });
        ASPx.Evt.AttachEventToElement(
          labelElement,
          "mousedown",
          function (evt) {
            internalCheckBox.Refocus();
          }
        );
      }
    },
    GetLabelElement: function (container) {
      var labelElement = ASPx.GetNodeByTagName(container, "LABEL", 0);
      if (!labelElement) {
        var labelCell = ASPx.GetNodeByClassName(
          container,
          "dxichTextCellSys",
          0
        );
        labelElement = ASPx.GetNodeByTagName(labelCell, "SPAN", 0);
      }
      return labelElement;
    },
  });
  CheckEditElementHelper.Instance = new CheckEditElementHelper();
  ASPx.ValidationType = ValidationType;
  ASPx.ErrorFrameDisplay = ErrorFrameDisplay;
  ASPx.EditElementSuffix = EditElementSuffix;
  ASPx.ValidationPattern = ValidationPattern;
  ASPx.RequiredFieldValidationPattern = RequiredFieldValidationPattern;
  ASPx.RegularExpressionValidationPattern = RegularExpressionValidationPattern;
  ASPx.CheckEditElementHelper = CheckEditElementHelper;
  ASPx.IsEditorFocusable = _aspxIsEditorFocusable;
  window.ASPxClientEditBase = ASPxClientEditBase;
  window.ASPxClientEdit = ASPxClientEdit;
  window.ASPxClientEditKeyEventArgs = ASPxClientEditKeyEventArgs;
  window.ASPxClientEditValidationEventArgs = ASPxClientEditValidationEventArgs;
})();

(function () {
  ASPx.TEInputSuffix = "_I";
  ASPx.PasteCheckInterval = 50;
  var passwordInputClonedSuffix = "_CLND";
  var memoMinHeight = 34;
  var BrowserHelper = {
    SAFARI_SYSTEM_CLASS_NAME: "dxeSafariSys",
    MOBILE_SAFARI_SYSTEM_CLASS_NAME: "dxeIPadSys",
    GetBrowserSpecificSystemClassName: function () {
      if (ASPx.Browser.Safari)
        return ASPx.Browser.MacOSMobilePlatform
          ? this.MOBILE_SAFARI_SYSTEM_CLASS_NAME
          : this.SAFARI_SYSTEM_CLASS_NAME;
      return "";
    },
  };
  var ASPxClientTextEdit = ASPx.CreateClass(ASPxClientEdit, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.isASPxClientTextEdit = true;
      this.nullText = "";
      this.escCount = 0;
      this.raiseValueChangedOnEnter = true;
      this.autoResizeWithContainer = false;
      this.lastChangedValue = null;
      this.passwordNullTextIntervalID = -1;
      this.nullTextInputElement = null;
      this.helpText = "";
      this.helpTextObj = null;
      this.helpTextStyle = [];
      this.externalTableStyle = [];
      this.helpTextPosition = ASPx.Position.Right;
      this.helpTextMargins = null;
      this.helpTextHAlign = ASPxClientTextEditHelpTextHAlign.Left;
      this.helpTextVAlign = ASPxClientTextEditHelpTextVAlign.Top;
      this.enableHelpTextPopupAnimation = true;
      this.helpTextDisplayMode = ASPxClientTextEditHelpTextDisplayMode.Inline;
      this.maskInfo = null;
      this.maskValueBeforeUserInput = "";
      this.maskPasteTimerID = -1;
      this.maskPasteLock = false;
      this.maskPasteCounter = 0;
      this.maskTextBeforePaste = "";
      this.maskHintHtml = "";
      this.maskHintTimerID = -1;
      this.maskedEditorClickEventHandlers = [];
      this.errorCellPosition = ASPx.Position.Right;
      this.displayFormat = null;
      this.TextChanged = new ASPxClientEvent();
    },
    Initialize: function () {
      this.SaveChangedValue();
      ASPxClientEdit.prototype.Initialize.call(this);
      this.CorrectInputMaxLength();
      this.SubscribeToIeDropEvent();
      if (ASPx.Browser.WebKitFamily) this.CorrectMainElementWhiteSpaceStyle();
      if (this.GetInputElement().type == "password")
        this.ToggleTextDecoration();
    },
    InlineInitialize: function () {
      ASPxClientEdit.prototype.InlineInitialize.call(this);
      if (this.maskInfo != null) this.InitMask();
      this.ApplyBrowserSpecificClassName();
      this.helpTextInitialize();
      if (ASPx.Browser.IE && ASPx.Browser.Version >= 10 && this.nullText != "")
        this.addIEXButtonEventHandler();
    },
    InitializeEvents: function () {
      ASPxClientEdit.prototype.InitializeEvents.call(this);
      ASPx.Evt.AttachEventToElement(
        this.GetInputElement(),
        "keydown",
        this.OnKeyDown.aspxBind(this)
      );
      ASPx.Evt.AttachEventToElement(
        this.GetInputElement(),
        "keyup",
        this.OnKeyUp.aspxBind(this)
      );
      ASPx.Evt.AttachEventToElement(
        this.GetInputElement(),
        "keypress",
        this.OnKeyPress.aspxBind(this)
      );
    },
    AdjustControl: function () {
      ASPxClientEdit.prototype.AdjustControl.call(this);
      if (ASPx.Browser.IE && ASPx.Browser.Version > 8 && !this.isNative)
        this.correctInputElementHeight();
    },
    correctInputElementHeight: function () {
      var mainElement = this.GetMainElement();
      var inputElement = this.GetInputElement();
      if (mainElement) {
        var mainElementHeight = mainElement.style.height;
        var mainElementHeightSpecified =
          mainElementHeight && mainElementHeight.indexOf("px") !== -1;
        if (mainElementHeightSpecified) {
          var inputElementHeight = this.getInputElementHeight();
          inputElement.style.height = inputElementHeight + "px";
          if (!ASPx.Ident.IsASPxClientMemo(this))
            inputElement.style.lineHeight = inputElementHeight + "px";
        }
      }
    },
    getInputElementHeight: function () {
      var mainElement = this.GetMainElement(),
        inputElement = this.GetInputElement();
      var inputElementHeight =
        ASPx.Browser.IE && ASPx.Browser.Version > 9
          ? ASPx.PxToInt(getComputedStyle(mainElement).height)
          : mainElement.offsetHeight -
            ASPx.GetTopBottomBordersAndPaddingsSummaryValue(mainElement);
      var inputElementContainer = inputElement.parentNode,
        inputContainerStyle = ASPx.GetCurrentStyle(inputElementContainer);
      inputElementHeight -=
        ASPx.GetTopBottomBordersAndPaddingsSummaryValue(
          inputElementContainer,
          inputContainerStyle
        ) +
        ASPx.GetTopBottomMargins(inputElementContainer, inputContainerStyle);
      var mainElementCellspacing = ASPx.GetCellSpacing(mainElement);
      if (mainElementCellspacing)
        inputElementHeight -= mainElementCellspacing * 2;
      var inputStyle = ASPx.GetCurrentStyle(inputElement);
      inputElementHeight -=
        ASPx.GetTopBottomBordersAndPaddingsSummaryValue(
          inputElement,
          inputStyle
        ) + ASPx.GetTopBottomMargins(inputElement, inputStyle);
      return inputElementHeight;
    },
    addIEXButtonEventHandler: function () {
      var inputElement = this.GetInputElement();
      if (ASPx.IsExists(inputElement)) {
        this.isDeleteOrBackspaceKeyClick = false;
        ASPx.Evt.AttachEventToElement(
          inputElement,
          "input",
          function (evt) {
            if (this.isDeleteOrBackspaceKeyClick) {
              this.isDeleteOrBackspaceKeyClick = false;
              return;
            }
            if (inputElement.value === "") {
              this.SyncRawValue();
            }
          }.aspxBind(this)
        );
        ASPx.Evt.AttachEventToElement(
          inputElement,
          "keydown",
          function (evt) {
            this.isDeleteOrBackspaceKeyClick =
              evt.keyCode == ASPx.Key.Delete ||
              evt.keyCode == ASPx.Key.Backspace;
          }.aspxBind(this)
        );
      }
    },
    ensureOutOfRangeWarningManager: function (
      minValue,
      maxValue,
      defaultMinValue,
      defaultMaxValue,
      valueFormatter
    ) {
      if (!this.outOfRangeWarningManager)
        this.outOfRangeWarningManager = new ASPxOutOfRangeWarningManager(
          this,
          minValue,
          maxValue,
          defaultMinValue,
          defaultMaxValue,
          this.hasRightPopupHelpText()
            ? ASPx.Position.Bottom
            : ASPx.Position.Right,
          valueFormatter
        );
    },
    helpTextInitialize: function () {
      if (this.helpText) {
        this.helpTextObj = new ASPxClientTextEditHelpText(
          this,
          this.helpTextStyle,
          this.helpText,
          this.helpTextPosition,
          this.helpTextHAlign,
          this.helpTextVAlign,
          this.helpTextMargins,
          this.enableHelpTextPopupAnimation,
          this.helpTextDisplayMode
        );
      }
    },
    hasRightPopupHelpText: function () {
      return (
        this.helpText &&
        this.helpTextDisplayMode ===
          ASPxClientTextEditHelpTextDisplayMode.Popup &&
        this.helpTextPosition === ASPx.Position.Right
      );
    },
    showHelpText: function () {
      if (this.helpTextObj) this.helpTextObj.show();
    },
    hideHelpText: function () {
      if (this.helpTextObj) this.helpTextObj.hide();
    },
    ApplyBrowserSpecificClassName: function () {
      var mainElement = this.GetMainElement();
      if (ASPx.IsExistsElement(mainElement)) {
        var className = BrowserHelper.GetBrowserSpecificSystemClassName();
        if (className) mainElement.className += " " + className;
      }
    },
    CorrectMainElementWhiteSpaceStyle: function () {
      var inputElement = this.GetInputElement();
      if (inputElement && inputElement.parentNode) {
        if (this.IsElementHasWhiteSpaceStyle(inputElement.parentNode))
          inputElement.parentNode.style.whiteSpace = "normal";
      }
    },
    IsElementHasWhiteSpaceStyle: function (element) {
      var currentStyle = ASPx.GetCurrentStyle(element);
      return (
        currentStyle.whiteSpace == "nowrap" || currentStyle.whiteSpace == "pre"
      );
    },
    FindInputElement: function () {
      return this.isNative
        ? this.GetMainElement()
        : ASPx.GetElementById(this.name + ASPx.TEInputSuffix);
    },
    DecodeRawInputValue: function (value) {
      return value;
    },
    GetRawValue: function (value) {
      return ASPx.IsExists(this.stateObject) ? this.stateObject.rawValue : null;
    },
    SetRawValue: function (value) {
      if (ASPx.IsExists(value)) value = value.toString();
      this.UpdateStateObjectWithObject({ rawValue: value });
    },
    SyncRawValue: function () {
      if (this.maskInfo != null) this.SetRawValue(this.maskInfo.GetValue());
      else this.SetRawValue(this.GetInputElement().value);
    },
    HasTextDecorators: function () {
      return this.nullText != "" || this.displayFormat != null;
    },
    CanApplyTextDecorators: function () {
      return !this.focused;
    },
    GetDecoratedText: function (value) {
      if (this.IsNull(value) && this.nullText != "") {
        if (this.CanApplyNullTextDecoration) {
          if (this.CanApplyNullTextDecoration()) return this.nullText;
        } else {
          return this.nullText;
        }
      }
      if (this.displayFormat != null)
        return ASPx.Formatter.Format(this.displayFormat, value);
      if (this.maskInfo != null) return this.maskInfo.GetText();
      if (value == null) return "";
      return value;
    },
    ToggleTextDecoration: function () {
      if (this.HasTextDecorators()) {
        if (this.focused) {
          var input = this.GetInputElement();
          var oldValue = input.value;
          var sel = ASPx.Selection.GetExtInfo(input);
          this.ToggleTextDecorationCore();
          if (oldValue != input.value) {
            if (sel.startPos == 0 && sel.endPos == oldValue.length)
              sel.endPos = input.value.length;
            else sel.endPos = sel.startPos;
            ASPx.Selection.Set(input, sel.startPos, sel.endPos);
          }
        } else this.ToggleTextDecorationCore();
      }
    },
    ToggleTextDecorationCore: function () {
      if (this.maskInfo != null) {
        this.ApplyMaskInfo(false);
      } else {
        var input = this.GetInputElement();
        var rawValue = this.GetRawValue();
        var value = this.CanApplyTextDecorators()
          ? this.GetDecoratedText(rawValue)
          : rawValue;
        if (input.value != value) {
          if (input.type == "password")
            this.TogglePasswordInputTextDecoration(value);
          else input.value = value;
        }
      }
    },
    GetPasswordNullTextInputElement: function () {
      if (!this.isPasswordNullTextInputElementExists())
        this.nullTextInputElement = this.createPasswordNullTextInputElement();
      return this.nullTextInputElement;
    },
    createPasswordNullTextInputElement: function () {
      var inputElement = this.GetInputElement(),
        nullTextInputElement = document.createElement("INPUT");
      nullTextInputElement.className = inputElement.className;
      nullTextInputElement.style.cssText = inputElement.style.cssText;
      nullTextInputElement.id = inputElement.id + passwordInputClonedSuffix;
      nullTextInputElement.type = "text";
      if (ASPx.IsExists(inputElement.tabIndex))
        nullTextInputElement.tabIndex = inputElement.tabIndex;
      var onFocusEventHandler = function () {
        var inputElement = this.GetInputElement(),
          nullTextInputElement = this.GetPasswordNullTextInputElement();
        if (inputElement) {
          this.LockFocusEvents();
          ASPx.SetElementDisplay(inputElement, true);
          inputElement.focus();
          ASPx.SetElementDisplay(nullTextInputElement, false);
          this.ReplaceAssociatedIdInLabels(
            nullTextInputElement.id,
            inputElement.id
          );
        }
      }.aspxBind(this);
      ASPx.Evt.AttachEventToElement(
        nullTextInputElement,
        "focus",
        onFocusEventHandler
      );
      return nullTextInputElement;
    },
    isPasswordNullTextInputElementExists: function () {
      return ASPx.IsExistsElement(this.nullTextInputElement);
    },
    TogglePasswordNullTextTimeoutChecker: function () {
      if (this.passwordNullTextIntervalID < 0) {
        var timeoutChecker = function () {
          var inputElement = this.GetInputElement();
          if (
            ASPx.GetControlCollection().GetByName(this.name) !== this ||
            inputElement == null
          ) {
            window.clearTimeout(this.passwordNullTextIntervalID);
            this.passwordNullTextIntervalID = -1;
            return;
          } else {
            if (!this.focused) {
              var passwordNullTextInputElement =
                this.GetPasswordNullTextInputElement();
              if (
                passwordNullTextInputElement.value != this.nullText &&
                inputElement.value == ""
              ) {
                passwordNullTextInputElement.value = this.nullText;
                this.SetValue(null);
              }
              if (inputElement.value != "") {
                if (inputElement.style.display == "none") {
                  this.SetValue(inputElement.value);
                  this.UnhidePasswordInput();
                }
              } else {
                if (inputElement.style.display != "none") {
                  this.SetValue(null);
                  this.HidePasswordInput();
                }
              }
            }
          }
        }.aspxBind(this);
        timeoutChecker();
        this.passwordNullTextIntervalID = window.setInterval(
          timeoutChecker,
          100
        );
      }
    },
    TogglePasswordInputTextDecoration: function (value) {
      var inputElement = this.GetInputElement();
      var nullTextInputElement = this.GetPasswordNullTextInputElement();
      nullTextInputElement.value = value;
      var parentNode = inputElement.parentNode;
      if (
        ASPx.Data.ArrayIndexOf(parentNode.childNodes, nullTextInputElement) < 0
      ) {
        ASPx.Attr.ChangeStyleAttribute(nullTextInputElement, "display", "none");
        parentNode.appendChild(nullTextInputElement);
      }
      this.HidePasswordInput();
      this.TogglePasswordNullTextTimeoutChecker();
    },
    HidePasswordInput: function () {
      ASPx.Attr.ChangeStyleAttribute(this.GetInputElement(), "display", "none");
      ASPx.Attr.ChangeStyleAttribute(
        this.GetPasswordNullTextInputElement(),
        "display",
        ""
      );
      this.ReplaceAssociatedIdInLabels(
        this.GetInputElement().id,
        this.GetPasswordNullTextInputElement().id
      );
    },
    UnhidePasswordInput: function () {
      ASPx.Attr.ChangeStyleAttribute(this.GetInputElement(), "display", "");
      ASPx.Attr.ChangeStyleAttribute(
        this.GetPasswordNullTextInputElement(),
        "display",
        "none"
      );
      this.ReplaceAssociatedIdInLabels(
        this.GetPasswordNullTextInputElement().id,
        this.GetInputElement().id
      );
    },
    ReplaceAssociatedIdInLabels: function (oldId, newId) {
      var labels = document.getElementsByTagName("LABEL");
      for (var i = 0; i < labels.length; i++) {
        if (
          labels[i].attributes["for"] &&
          labels[i].attributes["for"].value == oldId
        )
          labels[i].attributes["for"].value = newId;
      }
    },
    GetFormattedText: function () {
      var value = this.GetValue();
      if (this.IsNull(value) && this.nullText != "") return this.GetText();
      return this.GetDecoratedText(value);
    },
    IsNull: function (value) {
      return value == null || value === "";
    },
    PopulateStyleDecorationPostfixes: function () {
      ASPxClientEdit.prototype.PopulateStyleDecorationPostfixes.call(this);
      this.styleDecoration.AddPostfix(ASPx.TEInputSuffix);
    },
    GetValue: function () {
      var value = null;
      if (this.maskInfo != null) value = this.maskInfo.GetValue();
      else if (this.HasTextDecorators()) value = this.GetRawValue();
      else value = this.GetInputElement().value;
      return value == "" && this.convertEmptyStringToNull ? null : value;
    },
    SetValue: function (value) {
      if (value == null || value === undefined) value = "";
      if (this.maskInfo != null) {
        this.maskInfo.SetValue(value.toString());
        this.ApplyMaskInfo(false);
        this.SavePrevMaskValue();
      } else if (this.HasTextDecorators()) {
        this.SetRawValue(value);
        this.GetInputElement().value =
          this.CanApplyTextDecorators() &&
          this.GetInputElement().type != "password"
            ? this.GetDecoratedText(value)
            : value;
      } else this.GetInputElement().value = value;
      if (this.styleDecoration) this.styleDecoration.Update();
      this.SaveChangedValue();
    },
    SetVisible: function (visible) {
      ASPxClientEdit.prototype.SetVisible.call(this, visible);
      if (
        this.helpTextDisplayMode ===
        ASPxClientTextEditHelpTextDisplayMode.Inline
      ) {
        if (visible) this.showHelpText();
        else this.hideHelpText();
      }
    },
    UnstretchInputElement: function () {
      var inputElement = this.GetInputElement();
      var mainElement = this.GetMainElement();
      var mainElementCurStyle = ASPx.GetCurrentStyle(mainElement);
      if (
        ASPx.IsExistsElement(mainElement) &&
        ASPx.IsExistsElement(inputElement) &&
        ASPx.IsExists(mainElementCurStyle) &&
        inputElement.style.width == "100%" &&
        (mainElementCurStyle.width == "" || mainElementCurStyle.width == "auto")
      )
        inputElement.style.width = "";
    },
    RestoreActiveElement: function (activeElement) {
      if (
        activeElement &&
        activeElement.setActive &&
        activeElement.tagName != "IFRAME"
      )
        activeElement.setActive();
    },
    RaiseValueChangedEvent: function () {
      var processOnServer =
        ASPxClientEdit.prototype.RaiseValueChangedEvent.call(this);
      processOnServer = this.RaiseTextChanged(processOnServer);
      return processOnServer;
    },
    InitMask: function () {
      var rawValue = this.GetRawValue();
      this.SetValue(
        rawValue.length
          ? this.DecodeRawInputValue(rawValue)
          : this.maskInfo.GetValue()
      );
      this.validationPatterns.unshift(
        new MaskValidationPattern(this.maskInfo.errorText, this.maskInfo)
      );
    },
    SetMaskPasteTimer: function () {
      this.ClearMaskPasteTimer();
      this.maskPasteTimerID = ASPx.Timer.SetControlBoundInterval(
        this.MaskPasteTimerProc,
        this,
        ASPx.PasteCheckInterval
      );
    },
    ClearMaskPasteTimer: function () {
      this.maskPasteTimerID = ASPx.Timer.ClearInterval(this.maskPasteTimerID);
    },
    SavePrevMaskValue: function () {
      this.maskValueBeforeUserInput = this.maskInfo.GetValue();
    },
    FillMaskInfo: function () {
      var input = this.GetInputElement();
      if (!input) return;
      var sel = ASPx.Selection.GetInfo(input);
      this.maskInfo.SetCaret(sel.startPos, sel.endPos - sel.startPos);
    },
    ApplyMaskInfo: function (applyCaret) {
      this.SyncRawValue();
      var input = this.GetInputElement();
      var text = this.GetMaskDisplayText();
      this.maskTextBeforePaste = text;
      if (input.value != text) input.value = text;
      if (applyCaret)
        ASPx.Selection.Set(
          input,
          this.maskInfo.caretPos,
          this.maskInfo.caretPos + this.maskInfo.selectionLength
        );
    },
    GetMaskDisplayText: function () {
      if (!this.focused && this.HasTextDecorators())
        return this.GetDecoratedText(this.maskInfo.GetValue());
      return this.maskInfo.GetText();
    },
    ShouldCancelMaskKeyProcessing: function (htmlEvent, keyDownInfo) {
      return ASPx.Evt.IsEventPrevented(htmlEvent);
    },
    HandleMaskKeyDown: function (evt) {
      var keyInfo = ASPx.MaskManager.CreateKeyInfoByEvent(evt);
      ASPx.MaskManager.keyCancelled = this.ShouldCancelMaskKeyProcessing(
        evt,
        keyInfo
      );
      if (ASPx.MaskManager.keyCancelled) {
        ASPx.Evt.PreventEvent(evt);
        return;
      }
      this.maskPasteLock = true;
      this.FillMaskInfo();
      var canHandle = ASPx.MaskManager.CanHandleControlKey(keyInfo);
      ASPx.MaskManager.savedKeyDownKeyInfo = keyInfo;
      if (canHandle) {
        ASPx.MaskManager.OnKeyDown(this.maskInfo, keyInfo);
        this.ApplyMaskInfo(true);
        ASPx.Evt.PreventEvent(evt);
      }
      ASPx.MaskManager.keyDownHandled = canHandle;
      this.maskPasteLock = false;
      this.UpdateMaskHintHtml();
    },
    HandleMaskKeyPress: function (evt) {
      var keyInfo = ASPx.MaskManager.CreateKeyInfoByEvent(evt);
      ASPx.MaskManager.keyCancelled =
        ASPx.MaskManager.keyCancelled ||
        this.ShouldCancelMaskKeyProcessing(
          evt,
          ASPx.MaskManager.savedKeyDownKeyInfo
        );
      if (ASPx.MaskManager.keyCancelled) {
        ASPx.Evt.PreventEvent(evt);
        return;
      }
      this.maskPasteLock = true;
      var printable =
        ASPx.MaskManager.savedKeyDownKeyInfo != null &&
        ASPx.MaskManager.IsPrintableKeyCode(
          ASPx.MaskManager.savedKeyDownKeyInfo
        );
      if (printable) {
        ASPx.MaskManager.OnKeyPress(this.maskInfo, keyInfo);
        this.ApplyMaskInfo(true);
      }
      if (printable || ASPx.MaskManager.keyDownHandled)
        ASPx.Evt.PreventEvent(evt);
      this.maskPasteLock = false;
      this.UpdateMaskHintHtml();
    },
    MaskPasteTimerProc: function () {
      if (this.maskPasteLock || !this.maskInfo) return;
      this.maskPasteCounter++;
      var inputElement = this.inputElement;
      if (!inputElement || this.maskPasteCounter > 40) {
        this.maskPasteCounter = 0;
        inputElement = this.GetInputElement();
        if (!ASPx.IsExistsElement(inputElement)) {
          this.ClearMaskPasteTimer();
          return;
        }
      }
      if (this.maskTextBeforePaste !== inputElement.value) {
        this.maskInfo.ProcessPaste(
          inputElement.value,
          ASPx.Selection.GetInfo(inputElement).endPos
        );
        this.ApplyMaskInfo(true);
      }
      if (!this.focused) this.ClearMaskPasteTimer();
    },
    BeginShowMaskHint: function () {
      if (!this.readOnly && this.maskHintTimerID == -1)
        this.maskHintTimerID = window.setInterval(ASPx.MaskHintTimerProc, 500);
    },
    EndShowMaskHint: function () {
      window.clearInterval(this.maskHintTimerID);
      this.maskHintTimerID = -1;
    },
    MaskHintTimerProc: function () {
      if (this.maskInfo) {
        this.FillMaskInfo();
        this.UpdateMaskHintHtml();
      } else {
        this.EndShowMaskHint();
      }
    },
    UpdateMaskHintHtml: function () {
      var hint = this.GetMaskHintElement();
      if (!ASPx.IsExistsElement(hint)) return;
      var html = ASPx.MaskManager.GetHintHtml(this.maskInfo);
      if (html == this.maskHintHtml) return;
      if (html != "") {
        var mainElement = this.GetMainElement();
        if (ASPx.IsExistsElement(mainElement)) {
          hint.innerHTML = html;
          hint.style.position = "absolute";
          hint.style.left =
            ASPx.PrepareClientPosForElement(
              ASPx.GetAbsoluteX(mainElement),
              mainElement,
              true
            ) + "px";
          hint.style.top =
            ASPx.PrepareClientPosForElement(
              ASPx.GetAbsoluteY(mainElement),
              mainElement,
              false
            ) +
            mainElement.offsetHeight +
            2 +
            "px";
          hint.style.display = "block";
        }
      } else {
        hint.style.display = "none";
      }
      this.maskHintHtml = html;
    },
    HideMaskHint: function () {
      var hint = this.GetMaskHintElement();
      if (ASPx.IsExistsElement(hint)) hint.style.display = "none";
      this.maskHintHtml = "";
    },
    GetMaskHintElement: function () {
      return ASPx.GetElementById(this.name + "_MaskHint");
    },
    OnFocus: function () {
      if (this.maskInfo != null && !ASPx.GetControlCollection().InCallback())
        this.SetMaskPasteTimer();
      ASPxClientEdit.prototype.OnFocus.call(this);
    },
    OnMouseWheel: function (evt) {
      if (this.readOnly || this.maskInfo == null) return;
      this.FillMaskInfo();
      ASPx.MaskManager.OnMouseWheel(
        this.maskInfo,
        ASPx.Evt.GetWheelDelta(evt) < 0 ? -1 : 1
      );
      this.ApplyMaskInfo(true);
      ASPx.Evt.PreventEvent(evt);
      this.UpdateMaskHintHtml();
    },
    OnBrowserWindowResize: function (evt) {
      if (!this.autoResizeWithContainer) this.AdjustControl();
    },
    IsValueChanged: function () {
      return this.GetValue() != this.lastChangedValue;
    },
    OnKeyDown: function (evt) {
      if (this.NeedPreventBrowserUndoBehaviour(evt))
        return ASPx.Evt.PreventEvent(evt);
      if (ASPx.Browser.IE && ASPx.Evt.GetKeyCode(evt) == ASPx.Key.Esc) {
        if (++this.escCount > 1) {
          ASPx.Evt.PreventEvent(evt);
          return;
        }
      } else this.escCount = 0;
      ASPxClientEdit.prototype.OnKeyDown.call(this, evt);
      if (!this.IsRaiseStandardOnChange(evt)) {
        if (!this.readOnly && this.maskInfo != null)
          this.HandleMaskKeyDown(evt);
      }
    },
    IsCtrlZ: function (evt) {
      return (
        evt.ctrlKey &&
        !evt.altKey &&
        !evt.shiftKey &&
        (ASPx.Evt.GetKeyCode(evt) == 122 || ASPx.Evt.GetKeyCode(evt) == 90)
      );
    },
    NeedPreventBrowserUndoBehaviour: function (evt) {
      var inputElement = this.GetInputElement();
      return this.IsCtrlZ(evt) && !!inputElement && !inputElement.value;
    },
    OnKeyPress: function (evt) {
      ASPxClientEdit.prototype.OnKeyPress.call(this, evt);
      if (
        !this.readOnly &&
        this.maskInfo != null &&
        !this.IsRaiseStandardOnChange(evt)
      )
        this.HandleMaskKeyPress(evt);
      if (this.NeedOnKeyEventEnd(evt, true)) this.OnKeyEventEnd(evt);
    },
    OnKeyUp: function (evt) {
      if (
        ASPx.Browser.Firefox &&
        !this.focused &&
        ASPx.Evt.GetKeyCode(evt) === ASPx.Key.Tab
      )
        return;
      if (this.NeedOnKeyEventEnd(evt, false)) {
        var proccessNextCommingPress =
          ASPx.Evt.GetKeyCode(evt) === ASPx.Key.Alt;
        this.OnKeyEventEnd(evt, proccessNextCommingPress);
      }
      ASPxClientEdit.prototype.OnKeyUp.call(this, evt);
    },
    NeedOnKeyEventEnd: function (evt, isKeyPress) {
      var handleKeyPress =
        this.maskInfo != null && evt.keyCode == ASPx.Key.Enter;
      return handleKeyPress == isKeyPress;
    },
    OnKeyEventEnd: function (evt, withDelay) {
      if (!this.readOnly) {
        if (this.IsRaiseStandardOnChange(evt)) this.RaiseStandardOnChange();
        this.SyncRawValueIfHasTextDecorators(withDelay);
      }
    },
    SyncRawValueIfHasTextDecorators: function (withDelay) {
      if (this.HasTextDecorators()) {
        if (withDelay) {
          window.setTimeout(
            function () {
              this.SyncRawValue();
            }.aspxBind(this),
            0
          );
        } else this.SyncRawValue();
      }
    },
    IsRaiseStandardOnChange: function (evt) {
      return (
        !this.specialKeyboardHandlingUsed &&
        this.raiseValueChangedOnEnter &&
        evt.keyCode == ASPx.Key.Enter
      );
    },
    GetFocusSelectAction: function () {
      if (this.maskInfo) return "start";
      return "all";
    },
    CorrectFocusWhenDisabled: function () {
      if (!this.GetEnabled()) {
        var inputElement = this.GetInputElement();
        if (inputElement) inputElement.blur();
        return true;
      }
      return false;
    },
    EnsureShowPopupHelpText: function () {
      if (
        this.helpTextDisplayMode === ASPxClientTextEditHelpTextDisplayMode.Popup
      )
        this.showHelpText();
    },
    EnsureHidePopupHelpText: function () {
      if (
        this.helpTextDisplayMode === ASPxClientTextEditHelpTextDisplayMode.Popup
      )
        this.hideHelpText();
    },
    OnFocusCore: function () {
      if (this.CorrectFocusWhenDisabled()) return;
      var wasLocked = this.IsFocusEventsLocked();
      ASPxClientEdit.prototype.OnFocusCore.call(this);
      this.CorrectInputMaxLength(true);
      if (this.maskInfo != null) {
        this.SavePrevMaskValue();
        this.BeginShowMaskHint();
        this.AttachOnMouseClickIfNeeded();
      }
      if (!wasLocked) this.ToggleTextDecoration();
      if (this.isPasswordNullTextInputElementExists())
        setTimeout(
          function () {
            this.EnsureShowPopupHelpText();
          }.aspxBind(this),
          0
        );
      else this.EnsureShowPopupHelpText();
    },
    clearMaskedEditorClickEventHandlers: function () {
      for (var i = 0; i < this.maskedEditorClickEventHandlers.length; i++)
        ASPx.Evt.DetachEventFromElement(
          this.GetInputElement(),
          "click",
          this.maskedEditorClickEventHandlers[i]
        );
      this.maskedEditorClickEventHandlers = [];
    },
    addMaskedEditorClickEventHandler: function () {
      this.maskedEditorClickEventHandlers.push(
        this.MouseClickOnMaskedEditorFunc
      );
      ASPx.Evt.AttachEventToElement(
        this.GetInputElement(),
        "click",
        this.MouseClickOnMaskedEditorFunc
      );
    },
    AttachOnMouseClickIfNeeded: function () {
      this.clearMaskedEditorClickEventHandlers();
      if (this.GetValue() == "" || this.GetValue() == null) {
        this.MouseClickOnMaskedEditorFunc = function (e) {
          this.clearMaskedEditorClickEventHandlers();
          var selectionInfo = ASPx.Selection.GetExtInfo(this.GetInputElement());
          if (selectionInfo.startPos == selectionInfo.endPos)
            this.SetCaretPosition(
              this.GetInitialCaretPositionInEmptyMaskedInput()
            );
        }.aspxBind(this);
        this.addMaskedEditorClickEventHandler();
      }
    },
    GetInitialCaretPositionInEmptyMaskedInput: function () {
      var maskParts = this.maskInfo.parts;
      return ASPx.MaskManager.IsLiteralPart(maskParts[0])
        ? maskParts[0].GetSize()
        : 0;
    },
    OnLostFocusCore: function () {
      var wasLocked = this.IsFocusEventsLocked();
      ASPxClientEdit.prototype.OnLostFocusCore.call(this);
      this.CorrectInputMaxLength();
      if (this.maskInfo != null) {
        this.EndShowMaskHint();
        this.HideMaskHint();
        if (this.maskInfo.ApplyFixes(null)) this.ApplyMaskInfo(false);
        this.RaiseStandardOnChange();
      }
      if (!wasLocked) this.ToggleTextDecoration();
      this.escCount = 0;
      this.EnsureHidePopupHelpText();
    },
    InputMaxLengthCorrectionRequired: function () {
      return (
        ASPx.Browser.IE &&
        ASPx.Browser.Version >= 10 &&
        (!this.isNative || this.nullText != "")
      );
    },
    CorrectInputMaxLength: function (onFocus) {
      if (this.InputMaxLengthCorrectionRequired()) {
        var input = this.GetInputElement();
        if (!ASPx.IsExists(this.inputMaxLength))
          this.inputMaxLength = input.maxLength;
        input.maxLength = onFocus ? this.inputMaxLength : -1;
      }
    },
    SubscribeToIeDropEvent: function () {
      if (this.InputMaxLengthCorrectionRequired()) {
        var input = this.GetInputElement();
        ASPx.Evt.AttachEventToElement(
          input,
          "drop",
          function (e) {
            this.CorrectInputMaxLength(true);
          }.aspxBind(this)
        );
      }
    },
    SetFocus: function () {
      if (this.isPasswordNullTextInputElementExists()) {
        this.GetPasswordNullTextInputElement().focus();
      } else {
        ASPxClientEdit.prototype.SetFocus.call(this);
      }
    },
    OnValueChanged: function () {
      if (this.maskInfo != null) {
        if (
          this.maskInfo.GetValue() == this.maskValueBeforeUserInput &&
          !this.IsValueChangeForced()
        )
          return;
        this.SavePrevMaskValue();
      }
      if (this.HasTextDecorators()) this.SyncRawValue();
      if (!this.IsValueChanged() && !this.IsValueChangeForced()) return;
      this.SaveChangedValue();
      ASPxClientEdit.prototype.OnValueChanged.call(this);
    },
    IsValueChangeForced: function () {
      return false;
    },
    OnTextChanged: function () {},
    SaveChangedValue: function () {
      this.lastChangedValue = this.GetValue();
    },
    RaiseStandardOnChange: function () {
      var element = this.GetInputElement();
      if (element && element.onchange) {
        element.onchange({ target: this.GetInputElement() });
      } else if (this.ValueChanged) {
        this.ValueChanged.FireEvent(this);
      }
    },
    RaiseTextChanged: function (processOnServer) {
      if (!this.TextChanged.IsEmpty()) {
        var args = new ASPxClientProcessingModeEventArgs(processOnServer);
        this.TextChanged.FireEvent(this, args);
        processOnServer = args.processOnServer;
      }
      return processOnServer;
    },
    GetText: function () {
      if (this.maskInfo != null) {
        return this.maskInfo.GetText();
      } else {
        var value = this.GetValue();
        return value != null ? value : "";
      }
    },
    SetText: function (value) {
      if (this.maskInfo != null) {
        this.maskInfo.SetText(value);
        this.ApplyMaskInfo(false);
        this.SavePrevMaskValue();
      } else {
        this.SetValue(value);
      }
    },
    SelectAll: function () {
      this.SetSelection(0, -1, false);
    },
    SetCaretPosition: function (pos) {
      var inputElement = this.GetInputElement();
      ASPx.Selection.SetCaretPosition(inputElement, pos);
    },
    SetSelection: function (startPos, endPos, scrollToSelection) {
      var inputElement = this.GetInputElement();
      ASPx.Selection.Set(inputElement, startPos, endPos, scrollToSelection);
    },
    ChangeEnabledAttributes: function (enabled) {
      var inputElement = this.GetInputElement();
      if (inputElement) {
        this.ChangeInputEnabledAttributes(
          inputElement,
          ASPx.Attr.ChangeAttributesMethod(enabled),
          enabled
        );
        if (this.specialKeyboardHandlingUsed)
          this.ChangeSpecialInputEnabledAttributes(
            inputElement,
            ASPx.Attr.ChangeEventsMethod(enabled)
          );
        this.ChangeInputEnabled(inputElement, enabled, this.readOnly);
      }
    },
    ChangeEnabledStateItems: function (enabled) {
      if (!this.isNative) {
        var sc = ASPx.GetStateController();
        sc.SetElementEnabled(this.GetMainElement(), enabled);
        sc.SetElementEnabled(this.GetInputElement(), enabled);
      }
    },
    ChangeInputEnabled: function (element, enabled, readOnly) {
      if (this.UseReadOnlyForDisabled())
        element.readOnly = !enabled || readOnly;
      else element.disabled = !enabled;
    },
    ChangeInputEnabledAttributes: function (element, method, enabled) {
      var ieTabIndexFix =
        enabled &&
        ASPx.Browser.IE &&
        element.setAttribute &&
        ASPx.Attr.IsExistsAttribute(element, "savedtabIndex");
      method(element, "tabIndex");
      if (!enabled) element.tabIndex = -1;
      if (ieTabIndexFix) {
        window.setTimeout(function () {
          if (element && element.parentNode)
            element.parentNode.replaceChild(element, element);
        }, 0);
      }
      method(element, "onclick");
      if (!this.NeedFocusCorrectionWhenDisabled()) method(element, "onfocus");
      method(element, "onblur");
      method(element, "onkeydown");
      method(element, "onkeypress");
      method(element, "onkeyup");
    },
    UseReadOnlyForDisabled: function () {
      return ASPx.Browser.IE && ASPx.Browser.Version < 10 && !this.isNative;
    },
    NeedFocusCorrectionWhenDisabled: function () {
      return ASPx.Browser.IE && ASPx.Browser.Version < 10 && !this.isNative;
    },
    OnPostFinalization: function (args) {
      if (
        this.GetEnabled() ||
        !this.UseReadOnlyForDisabled() ||
        args.isDXCallback
      )
        return;
      var inputElement = this.GetInputElement();
      if (inputElement) {
        var inputDisabled = inputElement.disabled;
        inputElement.disabled = true;
        window.setTimeout(
          function () {
            inputElement.disabled = inputDisabled;
          }.aspxBind(this),
          0
        );
      }
    },
  });
  MaskValidationPattern = ASPx.CreateClass(ASPx.ValidationPattern, {
    constructor: function (errorText, maskInfo) {
      this.constructor.prototype.constructor.call(this, errorText);
      this.maskInfo = maskInfo;
    },
    EvaluateIsValid: function (value) {
      return this.maskInfo.IsValid();
    },
  });
  ASPx.Ident.IsASPxClientTextEdit = function (obj) {
    return !!obj.isASPxClientTextEdit;
  };
  var ASPxClientTextBoxBase = ASPx.CreateClass(ASPxClientTextEdit, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.sizingConfig.allowSetHeight = false;
      this.sizingConfig.adjustControl = true;
    },
  });
  var ASPxClientTextBox = ASPx.CreateClass(ASPxClientTextBoxBase, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.isASPxClientTextBox = true;
    },
  });
  ASPxClientTextBox.Cast = ASPxClientControl.Cast;
  ASPx.Ident.IsASPxClientTextBox = function (obj) {
    return !!obj.isASPxClientTextBox;
  };
  var ASPxClientMemo = ASPx.CreateClass(ASPxClientTextEdit, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.isASPxClientMemo = true;
      this.raiseValueChangedOnEnter = false;
      this.maxLength = 0;
      this.pasteTimerID = -1;
      this.pasteTimerActivatorCount = 0;
    },
    Initialize: function () {
      ASPxClientTextEdit.prototype.Initialize.call(this);
      this.SaveChangedValue();
      this.maxLengthRestricted = this.maxLength > 0;
    },
    CutString: function () {
      var text = this.GetText();
      if (text.length > this.maxLength) {
        text = text.substring(0, this.maxLength);
        this.SetText(text);
      }
    },
    EventKeyCodeChangesTheInput: function (evt) {
      if (ASPx.IsPasteShortcut(evt)) return true;
      else if (evt.ctrlKey) return false;
      var keyCode = ASPx.Evt.GetKeyCode(evt);
      var isSystemKey =
        ASPx.Key.Windows <= keyCode && keyCode <= ASPx.Key.ContextMenu;
      var isFKey = ASPx.Key.F1 <= keyCode && keyCode <= 127;
      return (
        (ASPx.Key.Delete < keyCode && !isSystemKey && !isFKey) ||
        keyCode == ASPx.Key.Enter ||
        keyCode == ASPx.Key.Space
      );
    },
    OnTextChangingCheck: function () {
      if (this.maxLengthRestricted) this.CutString();
    },
    StartTextChangingTimer: function () {
      if (this.maxLengthRestricted) {
        if (this.pasteTimerActivatorCount == 0) this.SetTextChangingTimer();
        this.pasteTimerActivatorCount++;
      }
    },
    EndTextChangingTimer: function () {
      if (this.maxLengthRestricted) {
        this.pasteTimerActivatorCount--;
        if (this.pasteTimerActivatorCount == 0) this.ClearTextChangingTimer();
      }
    },
    CollapseEditor: function () {
      if (!this.IsAdjustmentRequired()) return;
      var mainElement = this.GetMainElement();
      var inputElement = this.GetInputElement();
      if (
        !ASPx.IsExistsElement(mainElement) ||
        !ASPx.IsExistsElement(inputElement)
      )
        return;
      ASPxClientTextEdit.prototype.CollapseEditor.call(this);
      var mainElementCurStyle = ASPx.GetCurrentStyle(mainElement);
      if (this.heightCorrectionRequired && mainElement && inputElement) {
        if (
          mainElement.style.height == "100%" ||
          mainElementCurStyle.height == "100%"
        ) {
          mainElement.style.height = "0";
          mainElement.wasCollapsed = true;
        }
        inputElement.style.height = "0";
      }
    },
    CorrectEditorHeight: function () {
      var mainElement = this.GetMainElement();
      if (mainElement.wasCollapsed) {
        mainElement.wasCollapsed = null;
        ASPx.SetOffsetHeight(
          mainElement,
          ASPx.GetClearClientHeight(ASPx.FindOffsetParent(mainElement))
        );
      }
      if (!this.isNative) {
        var inputElement = this.GetInputElement();
        var inputClearClientHeight = ASPx.GetClearClientHeight(
          ASPx.FindOffsetParent(inputElement)
        );
        if (ASPx.Browser.IE) {
          inputClearClientHeight -= 2;
          var calculatedMainElementStyle = ASPx.GetCurrentStyle(mainElement);
          inputClearClientHeight +=
            ASPx.PxToInt(calculatedMainElementStyle.borderTopWidth) +
            ASPx.PxToInt(calculatedMainElementStyle.borderBottomWidth);
        }
        if (inputClearClientHeight < memoMinHeight)
          inputClearClientHeight = memoMinHeight;
        ASPx.SetOffsetHeight(inputElement, inputClearClientHeight);
        mainElement.style.height = "100%";
        var inputParentOffsetHeight = ASPx.GetClearClientHeight(
          ASPx.FindOffsetParent(inputElement)
        );
        if (inputParentOffsetHeight != inputClearClientHeight) {
          ASPx.SetOffsetHeight(inputElement, inputParentOffsetHeight);
        }
      }
    },
    SetWidth: function (width) {
      this.constructor.prototype.SetWidth.call(this, width);
      if (ASPx.Browser.IE) this.AdjustControl();
    },
    SetHeight: function (height) {
      var textarea = this.GetInputElement();
      textarea.style.height = "1px";
      this.constructor.prototype.SetHeight.call(this, height);
      textarea.style.height =
        ASPx.GetClearClientHeight(this.GetMainElement()) -
        ASPx.GetTopBottomBordersAndPaddingsSummaryValue(textarea) +
        "px";
    },
    ClearErrorFrameElementsStyles: function () {
      var textarea = this.GetInputElement();
      if (!textarea) return;
      var scrollBarPosition = textarea.scrollTop;
      ASPxClientTextEdit.prototype.ClearErrorFrameElementsStyles.call(this);
      if (ASPx.Browser.Firefox) textarea.scrollTop = scrollBarPosition;
    },
    OnMouseOver: function () {
      this.StartTextChangingTimer();
    },
    OnMouseOut: function () {
      this.EndTextChangingTimer();
    },
    OnFocus: function () {
      this.StartTextChangingTimer();
      ASPxClientEdit.prototype.OnFocus.call(this);
    },
    OnLostFocus: function () {
      this.EndTextChangingTimer();
      ASPxClientEdit.prototype.OnLostFocus.call(this);
    },
    OnKeyDown: function (evt) {
      if (this.NeedPreventBrowserUndoBehaviour(evt))
        return ASPx.Evt.PreventEvent(evt);
      if (this.maxLengthRestricted) {
        var selection = ASPx.Selection.GetInfo(this.GetInputElement());
        var noCharToReplace = selection.startPos == selection.endPos;
        if (
          this.GetText().length >= this.maxLength &&
          noCharToReplace &&
          this.EventKeyCodeChangesTheInput(evt)
        ) {
          return ASPx.Evt.PreventEvent(evt);
        }
      }
      ASPxClientEdit.prototype.OnKeyDown.call(this, evt);
    },
    SetTextChangingTimer: function () {
      this.pasteTimerID = ASPx.Timer.SetControlBoundInterval(
        this.OnTextChangingCheck,
        this,
        ASPx.PasteCheckInterval
      );
    },
    ClearTextChangingTimer: function () {
      this.pasteTimerID = ASPx.Timer.ClearInterval(this.pasteTimerID);
    },
  });
  ASPxClientMemo.Cast = ASPxClientControl.Cast;
  ASPx.Ident.IsASPxClientMemo = function (obj) {
    return !!obj.isASPxClientMemo;
  };
  var CLEAR_BUTTON_INDEX = -100;
  var HIDE_CONTENT_CSS_CLASS_NAME = "dxHideContent";
  var setContentVisibility = function (clearButtonElement, value) {
    var action = value
      ? ASPx.RemoveClassNameFromElement
      : ASPx.AddClassNameToElement;
    action(clearButtonElement, HIDE_CONTENT_CSS_CLASS_NAME);
  };
  var CLEAR_BUTTON_DISPLAY_MODE = {
    AUTO: "Auto",
    ALWAYS: "Always",
    NEVER: "Never",
    ON_HOVER: "OnHover",
  };
  var ASPxClientButtonEditBase = ASPx.CreateClass(ASPxClientTextBoxBase, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.allowUserInput = true;
      this.isValueChanging = false;
      this.allowMouseWheel = true;
      this.isMouseOver = false;
      this.buttonCount = 0;
      this.emptyValueMaskDisplayText = "";
      this.clearButtonDisplayMode = CLEAR_BUTTON_DISPLAY_MODE.AUTO;
      this.forceShowClearButtonAlways = false;
      this.ButtonClick = new ASPxClientEvent();
    },
    Initialize: function () {
      ASPxClientTextBoxBase.prototype.Initialize.call(this);
      this.EnsureEmptyValueMaskDisplayText();
      if (this.HasClearButton()) this.InitializeClearButton();
    },
    InlineInitialize: function () {
      ASPxClientTextBoxBase.prototype.InlineInitialize.call(this);
      if (this.clearButtonDisplayMode === CLEAR_BUTTON_DISPLAY_MODE.AUTO) {
        this.clearButtonDisplayMode =
          this.IsClearButtonVisibleAuto() || this.forceShowClearButtonAlways
            ? CLEAR_BUTTON_DISPLAY_MODE.ALWAYS
            : CLEAR_BUTTON_DISPLAY_MODE.NEVER;
      }
      this.EnsureClearButtonVisibility();
    },
    InitializeClearButton: function () {
      if (this.clearButtonDisplayMode === CLEAR_BUTTON_DISPLAY_MODE.ON_HOVER) {
        var mainElement = this.GetMainElement();
        ASPx.Evt.AttachMouseEnterToElement(
          mainElement,
          this.OnMouseOver.aspxBind(this),
          this.OnMouseOut.aspxBind(this)
        );
      }
    },
    IsClearButtonVisibleAuto: function () {
      return ASPx.Browser.MobileUI;
    },
    EnsureEmptyValueMaskDisplayText: function () {
      if (this.maskInfo && this.HasClearButton()) {
        var savedText = this.maskInfo.GetText();
        this.maskInfo.SetText("");
        this.emptyValueMaskDisplayText = this.maskInfo.GetText();
        this.maskInfo.SetText(savedText);
      }
    },
    GetButton: function (number) {
      return this.GetChildElement("B" + number);
    },
    SetButtonVisible: function (number, value) {
      var button = this.GetButton(number);
      if (!button) return;
      var isAlwaysShownClearButton =
        number === CLEAR_BUTTON_INDEX &&
        this.clearButtonDisplayMode === CLEAR_BUTTON_DISPLAY_MODE.ALWAYS;
      var visibilityModifier = isAlwaysShownClearButton
        ? setContentVisibility
        : ASPx.SetElementDisplay;
      visibilityModifier(button, value);
    },
    GetButtonVisible: function (number) {
      var button = this.GetButton(number);
      if (
        number === CLEAR_BUTTON_INDEX &&
        this.clearButtonDisplayMode === CLEAR_BUTTON_DISPLAY_MODE.ALWAYS
      )
        return (
          button &&
          !ASPx.ElementHasCssClass(button, HIDE_CONTENT_CSS_CLASS_NAME)
        );
      return button && ASPx.IsElementVisible(button);
    },
    ProcessInternalButtonClick: function (buttonIndex) {
      return false;
    },
    OnButtonClick: function (number) {
      var processOnServer = this.RaiseButtonClick(number);
      if (!this.ProcessInternalButtonClick(number) && processOnServer)
        this.SendPostBack("BC:" + number);
    },
    GetLastSuccesfullValue: function () {
      return this.lastChangedValue;
    },
    OnClear: function () {
      this.ClearEditorValueAndForceOnChange();
      this.ForceRefocusEditor(null, true);
      window.setTimeout(this.EnsureClearButtonVisibility.aspxBind(this), 0);
    },
    ClearEditorValueAndForceOnChange: function () {
      if (this.readOnly || !this.GetButtonVisible(CLEAR_BUTTON_INDEX)) return;
      var raiseOnChange = this.ClearEditorValueByClearButton();
      if (raiseOnChange) this.ForceStandardOnChange();
    },
    ClearEditorValueByClearButton: function () {
      var prevValue = this.GetLastSuccesfullValue();
      this.ClearEditorValueByClearButtonCore();
      return prevValue !== this.GetValue();
    },
    ClearEditorValueByClearButtonCore: function () {
      this.Clear();
      this.GetInputElement().value = "";
    },
    ForceStandardOnChange: function () {
      this.forceValueChanged = true;
      this.RaiseStandardOnChange();
      this.forceValueChanged = false;
    },
    IsValueChangeForced: function () {
      return (
        this.forceValueChanged ||
        ASPxClientTextBoxBase.prototype.IsValueChangeForced.call(this)
      );
    },
    IsValueChanging: function () {
      return this.isValueChanging;
    },
    StartValueChanging: function () {
      this.isValueChanging = true;
    },
    EndValueChanging: function () {
      this.isValueChanging = false;
    },
    IsClearButtonElement: function (element) {
      return ASPx.GetIsParent(this.GetClearButton(), element);
    },
    OnFocusCore: function () {
      ASPxClientTextBoxBase.prototype.OnFocusCore.call(this);
      this.EnsureClearButtonVisibility();
    },
    OnLostFocusCore: function () {
      ASPxClientTextBoxBase.prototype.OnLostFocusCore.call(this);
      this.EnsureClearButtonVisibility();
    },
    GetClearButton: function () {
      return this.GetButton(CLEAR_BUTTON_INDEX);
    },
    HasClearButton: function () {
      return !!this.GetClearButton();
    },
    RequireShowClearButton: function () {
      if (
        !this.clientEnabled ||
        !this.HasClearButton() ||
        this.clearButtonDisplayMode === CLEAR_BUTTON_DISPLAY_MODE.NEVER
      )
        return false;
      var isFocused = this.IsFocused();
      if (
        !isFocused &&
        !this.isMouseOver &&
        this.clearButtonDisplayMode !== CLEAR_BUTTON_DISPLAY_MODE.ALWAYS
      )
        return false;
      if (isFocused) return this.RequireShowClearButtonCore();
      return !this.IsNullState();
    },
    IsFocused: function () {
      return this === ASPxClientEdit.GetFocusedEditor();
    },
    IsNullState: function () {
      return this.IsNull(this.GetValue());
    },
    RequireShowClearButtonCore: function () {
      var inputText = this.GetInputElement().value;
      return inputText !== this.GetEmptyValueDisplayText();
    },
    GetEmptyValueDisplayText: function () {
      return this.maskInfo ? this.emptyValueMaskDisplayText : "";
    },
    EnsureClearButtonVisibility: function () {
      this.SetButtonVisible(CLEAR_BUTTON_INDEX, this.RequireShowClearButton());
    },
    OnMouseOver: function () {
      this.isMouseOver = true;
      this.EnsureClearButtonVisibility();
    },
    OnMouseOut: function () {
      this.isMouseOver = false;
      this.EnsureClearButtonVisibility();
    },
    OnKeyPress: function (evt) {
      if (this.allowUserInput)
        ASPxClientTextBoxBase.prototype.OnKeyPress.call(this, evt);
    },
    OnKeyEventEnd: function (evt, withDelay) {
      ASPxClientTextBoxBase.prototype.OnKeyEventEnd.call(this, evt, withDelay);
      this.EnsureClearButtonVisibility();
    },
    RaiseButtonClick: function (number) {
      var processOnServer =
        this.autoPostBack || this.IsServerEventAssigned("ButtonClick");
      if (!this.ButtonClick.IsEmpty()) {
        var args = new ASPxClientButtonEditClickEventArgs(
          processOnServer,
          number
        );
        this.ButtonClick.FireEvent(this, args);
        processOnServer = args.processOnServer;
      }
      return processOnServer;
    },
    ChangeEnabledAttributes: function (enabled) {
      ASPxClientTextEdit.prototype.ChangeEnabledAttributes.call(this, enabled);
      for (var i = 0; i < this.buttonCount; i++) {
        var element = this.GetButton(i);
        if (element)
          this.ChangeButtonEnabledAttributes(
            element,
            ASPx.Attr.ChangeAttributesMethod(enabled)
          );
      }
    },
    ChangeEnabledStateItems: function (enabled) {
      ASPxClientTextEdit.prototype.ChangeEnabledStateItems.call(this, enabled);
      for (var i = 0; i < this.buttonCount; i++) {
        var element = this.GetButton(i);
        if (element)
          ASPx.GetStateController().SetElementEnabled(element, enabled);
      }
    },
    ChangeButtonEnabledAttributes: function (element, method) {
      method(element, "onclick");
      method(element, "ondblclick");
      method(element, "on" + ASPx.TouchUIHelper.touchMouseDownEventName);
      method(element, "on" + ASPx.TouchUIHelper.touchMouseUpEventName);
    },
    ChangeInputEnabled: function (element, enabled, readOnly) {
      ASPxClientTextEdit.prototype.ChangeInputEnabled.call(
        this,
        element,
        enabled,
        readOnly || !this.allowUserInput
      );
    },
    SetValue: function (value) {
      ASPxClientTextEdit.prototype.SetValue.call(this, value);
      if (!this.IsFocused()) this.EnsureClearButtonVisibility();
    },
  });
  var ASPxClientButtonEdit = ASPx.CreateClass(ASPxClientButtonEditBase, {});
  ASPxClientButtonEdit.Cast = ASPxClientControl.Cast;
  var ASPxClientButtonEditClickEventArgs = ASPx.CreateClass(
    ASPxClientProcessingModeEventArgs,
    {
      constructor: function (processOnServer, buttonIndex) {
        this.constructor.prototype.constructor.call(this, processOnServer);
        this.buttonIndex = buttonIndex;
      },
    }
  );
  var ASPxClientTextEditHelpTextHAlign = {
    Left: "Left",
    Right: "Right",
    Center: "Center",
  };
  var ASPxClientTextEditHelpTextVAlign = {
    Top: "Top",
    Bottom: "Bottom",
    Middle: "Middle",
  };
  var ASPxClientTextEditHelpTextDisplayMode = {
    Inline: "Inline",
    Popup: "Popup",
  };
  var ASPxClientTextEditHelpTextConsts = {
    VERTICAL_ORIENTATION_CLASS_NAME: "dxeVHelpTextSys",
    HORIZONTAL_ORIENTATION_CLASS_NAME: "dxeHHelpTextSys",
  };
  var ASPxClientTextEditHelpText = ASPx.CreateClass(null, {
    constructor: function (
      editor,
      helpTextStyle,
      helpText,
      position,
      hAlign,
      vAlign,
      margins,
      animationEnabled,
      helpTextDisplayMode
    ) {
      this.hAlign = hAlign;
      this.vAlign = vAlign;
      this.animationEnabled = animationEnabled;
      this.displayMode = helpTextDisplayMode;
      this.editor = editor;
      this.editorMainElement = editor.GetMainElement();
      this.margins = margins
        ? {
            Top: margins[0],
            Right: margins[1],
            Bottom: margins[2],
            Left: margins[3],
          }
        : null;
      this.defaultMargins = { Top: 10, Right: 10, Bottom: 10, Left: 10 };
      this.position = position;
      this.helpTextElement = this.createHelpTextElement();
      this.setHelpTextZIndex(true);
      this.prepareHelpTextElement(helpTextStyle, helpText);
    },
    getRows: function (table) {
      return ASPx.GetChildNodesByTagName(table, "TR");
    },
    getCells: function (row) {
      return ASPx.GetChildNodesByTagName(row, "TD");
    },
    getCellByIndex: function (row, cellIndex) {
      return this.getCells(row)[cellIndex];
    },
    getCellIndex: function (row, cell) {
      var cells = this.getCells(row);
      for (var i = 0; i < cells.length; i++) {
        if (cells[i] === cell) return i;
      }
    },
    isHorizontal: function (position) {
      return (
        position === ASPx.Position.Left || position === ASPx.Position.Right
      );
    },
    isVertical: function (position) {
      return (
        position === ASPx.Position.Top || position === ASPx.Position.Bottom
      );
    },
    createEmptyCell: function (assignClassName) {
      var cell = document.createElement("TD");
      if (assignClassName) cell.className = "dxeFakeEmptyCell";
      return cell;
    },
    addHelpTextCellToExternalTableWithTwoCells: function (
      captionCell,
      errorCell,
      helpTextCell,
      errorTableBody,
      tableRows
    ) {
      var captionPosition = this.editor.captionPosition;
      var errorCellPosition = this.editor.errorCellPosition;
      var helpTextRow = this.isVertical(this.position)
        ? document.createElement("TR")
        : null;
      if (
        captionPosition === ASPx.Position.Left &&
        this.position === ASPx.Position.Left &&
        this.isHorizontal(errorCellPosition)
      )
        captionCell.parentNode.insertBefore(
          helpTextCell,
          captionCell.nextSibling
        );
      if (
        captionPosition === ASPx.Position.Right &&
        this.position === ASPx.Position.Right &&
        this.isHorizontal(errorCellPosition)
      )
        captionCell.parentNode.insertBefore(helpTextCell, captionCell);
      if (
        captionPosition === ASPx.Position.Left &&
        this.position === ASPx.Position.Right &&
        this.isHorizontal(errorCellPosition)
      )
        tableRows[0].appendChild(helpTextCell);
      if (
        captionPosition === ASPx.Position.Right &&
        this.position === ASPx.Position.Left &&
        this.isHorizontal(errorCellPosition)
      )
        tableRows[0].insertBefore(helpTextCell, tableRows[0].childNodes[0]);
      if (
        captionPosition === ASPx.Position.Top &&
        this.position === ASPx.Position.Bottom &&
        this.isVertical(errorCellPosition)
      ) {
        helpTextRow.appendChild(helpTextCell);
        errorTableBody.appendChild(helpTextRow);
      }
      if (
        captionPosition === ASPx.Position.Bottom &&
        this.position === ASPx.Position.Top &&
        this.isVertical(errorCellPosition)
      ) {
        helpTextRow.appendChild(helpTextCell);
        errorTableBody.insertBefore(helpTextRow, errorTableBody.childNodes[0]);
      }
      if (
        captionPosition === ASPx.Position.Top &&
        this.position === ASPx.Position.Top &&
        this.isVertical(errorCellPosition)
      ) {
        helpTextRow.appendChild(helpTextCell);
        errorTableBody.insertBefore(
          helpTextRow,
          captionCell.parentNode.nextSibling
        );
      }
      if (
        captionPosition === ASPx.Position.Bottom &&
        this.position === ASPx.Position.Bottom &&
        this.isVertical(errorCellPosition)
      ) {
        helpTextRow.appendChild(helpTextCell);
        errorTableBody.insertBefore(helpTextRow, captionCell.parentNode);
      }
      if (
        captionPosition === ASPx.Position.Right &&
        this.position === ASPx.Position.Top &&
        this.isVertical(errorCellPosition)
      ) {
        helpTextRow.appendChild(helpTextCell);
        helpTextRow.appendChild(this.createEmptyCell());
        errorTableBody.insertBefore(helpTextRow, errorTableBody.childNodes[0]);
      }
      if (this.position === ASPx.Position.Bottom) {
        if (
          (captionPosition === ASPx.Position.Right &&
            errorCellPosition === ASPx.Position.Top) ||
          (captionPosition === ASPx.Position.Top &&
            errorCellPosition === ASPx.Position.Right)
        ) {
          helpTextRow.appendChild(helpTextCell);
          helpTextRow.appendChild(this.createEmptyCell());
          errorTableBody.appendChild(helpTextRow);
        }
      }
      if (
        captionPosition === ASPx.Position.Left &&
        this.position === ASPx.Position.Top &&
        this.isVertical(errorCellPosition)
      ) {
        helpTextRow.appendChild(this.createEmptyCell());
        helpTextRow.appendChild(helpTextCell);
        errorTableBody.insertBefore(helpTextRow, errorTableBody.childNodes[0]);
      }
      if (
        captionPosition === ASPx.Position.Left &&
        this.position === ASPx.Position.Bottom &&
        this.isVertical(errorCellPosition)
      ) {
        helpTextRow.appendChild(this.createEmptyCell());
        helpTextRow.appendChild(helpTextCell);
        errorTableBody.appendChild(helpTextRow);
      }
      if (this.position === ASPx.Position.Right) {
        if (
          (captionPosition === ASPx.Position.Top &&
            errorCellPosition === ASPx.Position.Left) ||
          (captionPosition === ASPx.Position.Left &&
            errorCellPosition === ASPx.Position.Top) ||
          (captionPosition === ASPx.Position.Top &&
            errorCellPosition === ASPx.Position.Right)
        ) {
          tableRows[1].appendChild(helpTextCell);
          tableRows[0].appendChild(this.createEmptyCell());
        }
        if (
          (captionPosition === ASPx.Position.Left &&
            errorCellPosition === ASPx.Position.Bottom) ||
          (captionPosition === ASPx.Position.Bottom &&
            errorCellPosition === ASPx.Position.Left)
        ) {
          tableRows[0].appendChild(helpTextCell);
          tableRows[1].appendChild(this.createEmptyCell());
        }
      }
      if (this.position === ASPx.Position.Left) {
        if (
          (captionPosition === ASPx.Position.Right &&
            errorCellPosition === ASPx.Position.Top) ||
          (captionPosition === ASPx.Position.Top &&
            errorCellPosition === ASPx.Position.Right) ||
          (captionPosition === ASPx.Position.Top &&
            errorCellPosition === ASPx.Position.Left)
        ) {
          tableRows[1].insertBefore(helpTextCell, tableRows[1].childNodes[0]);
          tableRows[0].insertBefore(
            this.createEmptyCell(),
            tableRows[0].childNodes[0]
          );
        }
        if (
          (captionPosition === ASPx.Position.Bottom &&
            errorCellPosition === ASPx.Position.Top) ||
          (captionPosition === ASPx.Position.Top &&
            errorCellPosition === ASPx.Position.Bottom)
        ) {
          tableRows[1].insertBefore(helpTextCell, tableRows[1].childNodes[0]);
          tableRows[0].insertBefore(
            this.createEmptyCell(errorCellPosition === ASPx.Position.Top),
            tableRows[0].childNodes[0]
          );
          tableRows[2].insertBefore(
            this.createEmptyCell(errorCellPosition !== ASPx.Position.Top),
            tableRows[2].childNodes[0]
          );
        }
        if (
          captionPosition === ASPx.Position.Top &&
          errorCellPosition === ASPx.Position.Top
        ) {
          tableRows[2].insertBefore(helpTextCell, tableRows[2].childNodes[0]);
          tableRows[0].insertBefore(
            this.createEmptyCell(false),
            tableRows[0].childNodes[0]
          );
          tableRows[1].insertBefore(
            this.createEmptyCell(true),
            tableRows[1].childNodes[0]
          );
        }
        if (
          captionPosition === ASPx.Position.Bottom &&
          errorCellPosition === ASPx.Position.Bottom
        ) {
          tableRows[0].insertBefore(helpTextCell, tableRows[0].childNodes[0]);
          tableRows[1].insertBefore(
            this.createEmptyCell(true),
            tableRows[1].childNodes[0]
          );
          tableRows[2].insertBefore(
            this.createEmptyCell(false),
            tableRows[2].childNodes[0]
          );
        }
        if (
          (captionPosition === ASPx.Position.Bottom &&
            errorCellPosition === ASPx.Position.Left) ||
          (captionPosition === ASPx.Position.Right &&
            errorCellPosition === ASPx.Position.Bottom) ||
          (captionPosition === ASPx.Position.Bottom &&
            errorCellPosition === ASPx.Position.Right)
        ) {
          tableRows[0].insertBefore(helpTextCell, tableRows[0].childNodes[0]);
          tableRows[1].insertBefore(
            this.createEmptyCell(),
            tableRows[1].childNodes[0]
          );
        }
        if (
          captionPosition === ASPx.Position.Left &&
          this.isVertical(errorCellPosition)
        ) {
          captionCell.parentNode.insertBefore(
            helpTextCell,
            captionCell.nextSibling
          );
          var emptyCellParentRow =
            errorCellPosition === ASPx.Position.Top
              ? tableRows[0]
              : tableRows[1];
          var helpTextCellIndex = this.getCellIndex(
            helpTextCell.parentNode,
            helpTextCell
          );
          emptyCellParentRow.insertBefore(
            this.createEmptyCell(),
            this.getCellByIndex(emptyCellParentRow, helpTextCellIndex)
          );
        }
      }
      if (this.position === ASPx.Position.Right) {
        if (
          (captionPosition === ASPx.Position.Bottom &&
            errorCellPosition === ASPx.Position.Top) ||
          (captionPosition === ASPx.Position.Top &&
            errorCellPosition === ASPx.Position.Bottom)
        ) {
          tableRows[1].appendChild(helpTextCell);
          tableRows[0].appendChild(
            this.createEmptyCell(errorCellPosition === ASPx.Position.Top)
          );
          tableRows[2].appendChild(
            this.createEmptyCell(errorCellPosition !== ASPx.Position.Top)
          );
        }
        if (
          captionPosition === ASPx.Position.Top &&
          errorCellPosition === ASPx.Position.Top
        ) {
          tableRows[2].appendChild(helpTextCell);
          tableRows[0].appendChild(this.createEmptyCell(false));
          tableRows[1].appendChild(this.createEmptyCell(true));
        }
        if (
          captionPosition === ASPx.Position.Bottom &&
          errorCellPosition === ASPx.Position.Bottom
        ) {
          tableRows[0].appendChild(helpTextCell);
          tableRows[1].appendChild(this.createEmptyCell(true));
          tableRows[2].appendChild(this.createEmptyCell(false));
        }
        if (
          captionPosition === ASPx.Position.Bottom &&
          errorCellPosition === ASPx.Position.Right
        ) {
          tableRows[0].appendChild(helpTextCell);
          tableRows[1].appendChild(this.createEmptyCell());
        }
        if (
          captionPosition === ASPx.Position.Right &&
          this.isVertical(errorCellPosition)
        ) {
          captionCell.parentNode.insertBefore(helpTextCell, captionCell);
          var emptyCellParentRow =
            errorCellPosition === ASPx.Position.Top
              ? tableRows[0]
              : tableRows[1];
          var helpTextCellIndex = this.getCellIndex(
            helpTextCell.parentNode,
            helpTextCell
          );
          emptyCellParentRow.insertBefore(
            this.createEmptyCell(),
            this.getCellByIndex(emptyCellParentRow, helpTextCellIndex)
          );
        }
      }
      if (
        captionPosition === ASPx.Position.Top &&
        this.position === ASPx.Position.Top &&
        this.isHorizontal(errorCellPosition)
      ) {
        if (errorCellPosition === ASPx.Position.Left) {
          helpTextRow.appendChild(this.createEmptyCell(true));
          helpTextRow.appendChild(helpTextCell);
        } else {
          helpTextRow.appendChild(helpTextCell);
          helpTextRow.appendChild(this.createEmptyCell());
        }
        errorTableBody.insertBefore(
          helpTextRow,
          captionCell.parentNode.nextSibling
        );
      }
      if (
        captionPosition === ASPx.Position.Bottom &&
        this.position === ASPx.Position.Top &&
        this.isHorizontal(errorCellPosition)
      ) {
        if (errorCellPosition === ASPx.Position.Left) {
          helpTextRow.appendChild(this.createEmptyCell(true));
          helpTextRow.appendChild(helpTextCell);
        } else {
          helpTextRow.appendChild(helpTextCell);
          helpTextRow.appendChild(this.createEmptyCell());
        }
        errorTableBody.insertBefore(helpTextRow, errorTableBody.childNodes[0]);
      }
      if (
        captionPosition === ASPx.Position.Bottom &&
        this.position === ASPx.Position.Bottom &&
        this.isHorizontal(errorCellPosition)
      ) {
        if (errorCellPosition === ASPx.Position.Left) {
          helpTextRow.appendChild(this.createEmptyCell(true));
          helpTextRow.appendChild(helpTextCell);
        } else {
          helpTextRow.appendChild(helpTextCell);
          helpTextRow.appendChild(this.createEmptyCell());
        }
        errorTableBody.insertBefore(helpTextRow, captionCell.parentNode);
      }
      if (
        captionPosition === ASPx.Position.Top &&
        this.position === ASPx.Position.Bottom &&
        errorCellPosition === ASPx.Position.Left
      ) {
        helpTextRow.appendChild(this.createEmptyCell(true));
        helpTextRow.appendChild(helpTextCell);
        errorTableBody.appendChild(helpTextRow);
      }
      if (
        captionPosition === ASPx.Position.Right &&
        this.position === ASPx.Position.Bottom &&
        errorCellPosition === ASPx.Position.Bottom
      ) {
        helpTextRow.appendChild(helpTextCell);
        helpTextRow.appendChild(this.createEmptyCell());
        errorTableBody.appendChild(helpTextRow);
      }
      if (this.position === ASPx.Position.Bottom) {
        if (
          (captionPosition === ASPx.Position.Left &&
            errorCellPosition === ASPx.Position.Right) ||
          (captionPosition === ASPx.Position.Right &&
            errorCellPosition === ASPx.Position.Left)
        ) {
          helpTextRow.appendChild(
            this.createEmptyCell(errorCellPosition !== ASPx.Position.Right)
          );
          helpTextRow.appendChild(helpTextCell);
          helpTextRow.appendChild(
            this.createEmptyCell(errorCellPosition === ASPx.Position.Right)
          );
          errorTableBody.appendChild(helpTextRow);
        }
        if (
          captionPosition === ASPx.Position.Left &&
          errorCellPosition === ASPx.Position.Left
        ) {
          helpTextRow.appendChild(this.createEmptyCell(false));
          helpTextRow.appendChild(this.createEmptyCell(true));
          helpTextRow.appendChild(helpTextCell);
          errorTableBody.appendChild(helpTextRow);
        }
        if (
          captionPosition === ASPx.Position.Right &&
          errorCellPosition === ASPx.Position.Right
        ) {
          helpTextRow.appendChild(helpTextCell);
          helpTextRow.appendChild(this.createEmptyCell(true));
          helpTextRow.appendChild(this.createEmptyCell(false));
          errorTableBody.appendChild(helpTextRow);
        }
      }
      if (this.position === ASPx.Position.Top) {
        if (
          (captionPosition === ASPx.Position.Left &&
            errorCellPosition === ASPx.Position.Right) ||
          (captionPosition === ASPx.Position.Right &&
            errorCellPosition === ASPx.Position.Left)
        ) {
          helpTextRow.appendChild(
            this.createEmptyCell(errorCellPosition !== ASPx.Position.Right)
          );
          helpTextRow.appendChild(helpTextCell);
          helpTextRow.appendChild(
            this.createEmptyCell(errorCellPosition === ASPx.Position.Right)
          );
          errorTableBody.insertBefore(
            helpTextRow,
            errorTableBody.childNodes[0]
          );
        }
        if (
          captionPosition === ASPx.Position.Left &&
          errorCellPosition === ASPx.Position.Left
        ) {
          helpTextRow.appendChild(this.createEmptyCell(false));
          helpTextRow.appendChild(this.createEmptyCell(true));
          helpTextRow.appendChild(helpTextCell);
          errorTableBody.insertBefore(
            helpTextRow,
            errorTableBody.childNodes[0]
          );
        }
        if (
          captionPosition === ASPx.Position.Right &&
          errorCellPosition === ASPx.Position.Right
        ) {
          helpTextRow.appendChild(helpTextCell);
          helpTextRow.appendChild(this.createEmptyCell(true));
          helpTextRow.appendChild(this.createEmptyCell(false));
          errorTableBody.insertBefore(
            helpTextRow,
            errorTableBody.childNodes[0]
          );
        }
      }
    },
    addHelpTextCellToExternalTableWithErrorCell: function (
      errorCell,
      helpTextCell,
      errorTableBody,
      tableRows
    ) {
      var errorCellPosition = this.editor.errorCellPosition;
      var helpTextRow = document.createElement("TR");
      if (
        this.position === ASPx.Position.Left &&
        this.isHorizontal(errorCellPosition)
      )
        tableRows[0].insertBefore(helpTextCell, tableRows[0].childNodes[0]);
      if (
        this.position === ASPx.Position.Right &&
        this.isHorizontal(errorCellPosition)
      )
        tableRows[0].appendChild(helpTextCell);
      if (
        this.position === ASPx.Position.Top &&
        this.isVertical(errorCellPosition)
      ) {
        helpTextRow.appendChild(helpTextCell);
        errorTableBody.insertBefore(helpTextRow, errorTableBody.childNodes[0]);
      }
      if (
        this.position === ASPx.Position.Bottom &&
        this.isVertical(errorCellPosition)
      ) {
        helpTextRow.appendChild(helpTextCell);
        errorTableBody.appendChild(helpTextRow);
      }
      if (
        errorCellPosition === ASPx.Position.Left &&
        this.isVertical(this.position)
      ) {
        helpTextRow.appendChild(this.createEmptyCell(true));
        helpTextRow.appendChild(helpTextCell);
        if (this.position === ASPx.Position.Top)
          errorTableBody.insertBefore(
            helpTextRow,
            errorTableBody.childNodes[0]
          );
        else errorTableBody.appendChild(helpTextRow);
      }
      if (
        errorCellPosition === ASPx.Position.Right &&
        this.isVertical(this.position)
      ) {
        helpTextRow.appendChild(helpTextCell);
        helpTextRow.appendChild(this.createEmptyCell(true));
        if (this.position === ASPx.Position.Top)
          errorTableBody.insertBefore(
            helpTextRow,
            errorTableBody.childNodes[0]
          );
        else errorTableBody.appendChild(helpTextRow);
      }
      if (
        this.position === ASPx.Position.Left &&
        this.isVertical(errorCellPosition)
      ) {
        var helpTextParentRowIndex =
          errorCellPosition === ASPx.Position.Top ? 1 : 0;
        var emptyCellRowIndex = helpTextParentRowIndex === 0 ? 1 : 0;
        tableRows[helpTextParentRowIndex].insertBefore(
          helpTextCell,
          tableRows[helpTextParentRowIndex].childNodes[0]
        );
        tableRows[emptyCellRowIndex].insertBefore(
          this.createEmptyCell(true),
          tableRows[emptyCellRowIndex].childNodes[0]
        );
      }
      if (
        this.position === ASPx.Position.Right &&
        this.isVertical(errorCellPosition)
      ) {
        var helpTextParentRowIndex =
          errorCellPosition === ASPx.Position.Top ? 1 : 0;
        var emptyCellRowIndex = helpTextParentRowIndex === 0 ? 1 : 0;
        tableRows[helpTextParentRowIndex].appendChild(helpTextCell);
        tableRows[emptyCellRowIndex].appendChild(this.createEmptyCell(true));
      }
    },
    addHelpTextCellToExternalTableWithCaption: function (
      captionCell,
      helpTextCell,
      errorTableBody,
      tableRows
    ) {
      var captionPosition = this.editor.captionPosition;
      var helpTextRow = document.createElement("TR");
      if (
        captionPosition === ASPx.Position.Left &&
        this.isVertical(this.position)
      ) {
        helpTextRow.appendChild(this.createEmptyCell());
        helpTextRow.appendChild(helpTextCell);
        if (this.position === ASPx.Position.Top)
          errorTableBody.insertBefore(
            helpTextRow,
            errorTableBody.childNodes[0]
          );
        else errorTableBody.appendChild(helpTextRow);
      }
      if (
        this.position === ASPx.Position.Left &&
        this.isVertical(captionPosition)
      ) {
        var helpTextParentRowIndex =
          captionPosition === ASPx.Position.Top ? 1 : 0;
        var emptyCellParentRowIndex = helpTextParentRowIndex === 0 ? 1 : 0;
        tableRows[helpTextParentRowIndex].insertBefore(
          helpTextCell,
          tableRows[helpTextParentRowIndex].childNodes[0]
        );
        tableRows[emptyCellParentRowIndex].insertBefore(
          this.createEmptyCell(),
          tableRows[emptyCellParentRowIndex].childNodes[0]
        );
      }
      if (
        this.position === ASPx.Position.Right &&
        this.isVertical(captionPosition)
      ) {
        var helpTextParentRowIndex =
          captionPosition === ASPx.Position.Top ? 1 : 0;
        var emptyCellParentRowIndex = helpTextParentRowIndex === 0 ? 1 : 0;
        tableRows[helpTextParentRowIndex].appendChild(helpTextCell);
        tableRows[emptyCellParentRowIndex].appendChild(this.createEmptyCell());
      }
      if (
        captionPosition === ASPx.Position.Right &&
        this.isVertical(this.position)
      ) {
        helpTextRow.appendChild(helpTextCell);
        helpTextRow.appendChild(this.createEmptyCell());
        if (this.position === ASPx.Position.Top)
          errorTableBody.insertBefore(
            helpTextRow,
            errorTableBody.childNodes[0]
          );
        else errorTableBody.appendChild(helpTextRow);
      }
      if (this.isVertical(captionPosition) && this.isVertical(this.position)) {
        helpTextRow.appendChild(helpTextCell);
        if (
          captionPosition === ASPx.Position.Top &&
          this.position === ASPx.Position.Top
        )
          errorTableBody.insertBefore(
            helpTextRow,
            captionCell.parentNode.nextSibling
          );
        if (
          captionPosition === ASPx.Position.Top &&
          this.position === ASPx.Position.Bottom
        )
          errorTableBody.appendChild(helpTextRow);
        if (
          captionPosition === ASPx.Position.Bottom &&
          this.position === ASPx.Position.Top
        )
          errorTableBody.insertBefore(
            helpTextRow,
            errorTableBody.childNodes[0]
          );
        if (
          captionPosition === ASPx.Position.Bottom &&
          this.position === ASPx.Position.Bottom
        )
          errorTableBody.insertBefore(helpTextRow, captionCell.parentNode);
      }
      if (
        captionPosition === ASPx.Position.Left &&
        this.position === ASPx.Position.Left
      )
        captionCell.parentNode.insertBefore(
          helpTextCell,
          captionCell.nextSibling
        );
      if (
        captionPosition === ASPx.Position.Right &&
        this.position === ASPx.Position.Right
      )
        captionCell.parentNode.insertBefore(helpTextCell, captionCell);
      if (
        captionPosition === ASPx.Position.Left &&
        this.position === ASPx.Position.Right
      )
        tableRows[0].appendChild(helpTextCell);
      if (
        captionPosition === ASPx.Position.Right &&
        this.position === ASPx.Position.Left
      )
        tableRows[0].insertBefore(helpTextCell, tableRows[0].childNodes[0]);
    },
    addHelpTextCellToExternalTableWithEditorOnly: function (
      helpTextCell,
      errorTableBody,
      tableRows
    ) {
      if (this.isHorizontal(this.position)) {
        if (this.position === ASPx.Position.Left)
          tableRows[0].insertBefore(helpTextCell, tableRows[0].childNodes[0]);
        else tableRows[0].appendChild(helpTextCell);
      } else {
        var helpTextRow = document.createElement("TR");
        helpTextRow.appendChild(helpTextCell);
        if (this.position === ASPx.Position.Top)
          errorTableBody.insertBefore(
            helpTextRow,
            errorTableBody.childNodes[0]
          );
        else errorTableBody.appendChild(helpTextRow);
      }
    },
    addHelpTextCellToExternalTable: function (errorTable, helpTextCell) {
      var errorTableBody = ASPx.GetNodeByTagName(errorTable, "TBODY", 0);
      var tableRows = this.getRows(errorTableBody);
      var captionCell = this.editor.GetCaptionCell();
      var errorCell = this.editor.GetErrorCell();
      if (captionCell) {
        if (errorCell)
          this.addHelpTextCellToExternalTableWithTwoCells(
            captionCell,
            errorCell,
            helpTextCell,
            errorTableBody,
            tableRows
          );
        else
          this.addHelpTextCellToExternalTableWithCaption(
            captionCell,
            helpTextCell,
            errorTableBody,
            tableRows
          );
      } else if (errorCell)
        this.addHelpTextCellToExternalTableWithErrorCell(
          errorCell,
          helpTextCell,
          errorTableBody,
          tableRows
        );
      else
        this.addHelpTextCellToExternalTableWithEditorOnly(
          helpTextCell,
          errorTableBody,
          tableRows
        );
    },
    createExternalTable: function () {
      var externalTable = document.createElement("TABLE");
      externalTable.id =
        this.editor.name + ASPx.EditElementSuffix.ExternalTable;
      externalTable.cellPadding = 0;
      externalTable.cellSpacing = 0;
      this.applyExternalTableStyle(externalTable);
      var editorWidth = this.editorMainElement.style.width;
      if (ASPx.IsPercentageSize(editorWidth)) {
        externalTable.style.width = editorWidth;
        this.editorMainElement.style.width = "100%";
        this.editor.width = "100%";
      }
      var externalTableBody = document.createElement("TBODY");
      var externalTableRow = document.createElement("TR");
      var externalTableCell = document.createElement("TD");
      externalTable.appendChild(externalTableBody);
      externalTableBody.appendChild(externalTableRow);
      externalTableRow.appendChild(externalTableCell);
      this.editorMainElement.parentNode.appendChild(externalTable);
      ASPx.ChangeElementContainer(
        this.editorMainElement,
        externalTableCell,
        true
      );
      return externalTable;
    },
    applyExternalTableStyle: function (externalTable) {
      var externalTableStyle = this.editor.externalTableStyle;
      if (externalTableStyle.length > 0) {
        this.applyStyleToElement(externalTable, externalTableStyle);
      }
    },
    applyStyleToElement: function (element, style) {
      element.className = style[0];
      if (style[1]) {
        var styleSheet = ASPx.GetCurrentStyleSheet();
        element.className +=
          " " + ASPx.CreateImportantStyleRule(styleSheet, style[1]);
      }
    },
    createInlineHelpTextElement: function () {
      var helpTextElement = document.createElement("TD");
      var externalTable = this.editor.GetExternalTable();
      if (!externalTable) externalTable = this.createExternalTable();
      this.addHelpTextCellToExternalTable(externalTable, helpTextElement);
      return helpTextElement;
    },
    createPopupHelpTextElement: function () {
      var helpTextElement = document.createElement("DIV");
      document.body.appendChild(helpTextElement);
      ASPx.AnimationHelper.setOpacity(helpTextElement, 0);
      return helpTextElement;
    },
    createHelpTextElement: function () {
      return this.displayMode === ASPxClientTextEditHelpTextDisplayMode.Popup
        ? this.createPopupHelpTextElement()
        : this.createInlineHelpTextElement();
    },
    prepareHelpTextElement: function (helpTextStyle, helpText) {
      this.applyStyleToElement(this.helpTextElement, helpTextStyle);
      ASPx.SetInnerHtml(this.helpTextElement, "<SPAN>" + helpText + "</SPAN>");
      if (this.displayMode === ASPxClientTextEditHelpTextDisplayMode.Popup)
        this.updatePopupHelpTextPosition();
      else {
        var isVerticalOrientation =
          this.position === ASPx.Position.Top ||
          this.position === ASPx.Position.Bottom;
        var orientationClassName = isVerticalOrientation
          ? ASPxClientTextEditHelpTextConsts.VERTICAL_ORIENTATION_CLASS_NAME
          : ASPxClientTextEditHelpTextConsts.HORIZONTAL_ORIENTATION_CLASS_NAME;
        this.helpTextElement.className += " " + orientationClassName;
        this.setInlineHelpTextElementAlign();
        ASPx.SetElementDisplay(this.helpTextElement, this.editor.clientVisible);
      }
    },
    setInlineHelpTextElementAlign: function () {
      var hAlignValue = "",
        vAlignValue = "";
      switch (this.hAlign) {
        case ASPxClientTextEditHelpTextHAlign.Left:
          hAlignValue = "left";
          break;
        case ASPxClientTextEditHelpTextHAlign.Right:
          hAlignValue = "right";
          break;
        case ASPxClientTextEditHelpTextHAlign.Center:
          hAlignValue = "center";
          break;
      }
      switch (this.vAlign) {
        case ASPxClientTextEditHelpTextVAlign.Top:
          vAlignValue = "top";
          break;
        case ASPxClientTextEditHelpTextVAlign.Bottom:
          vAlignValue = "bottom";
          break;
        case ASPxClientTextEditHelpTextVAlign.Middle:
          vAlignValue = "middle";
          break;
      }
      this.helpTextElement.style.textAlign = hAlignValue;
      this.helpTextElement.style.verticalAlign = vAlignValue;
    },
    getHelpTextMargins: function () {
      if (this.margins) return this.margins;
      var result = this.defaultMargins;
      if (
        this.position === ASPx.Position.Top ||
        this.position === ASPx.Position.Bottom
      )
        result.Left = result.Right = 0;
      else result.Top = result.Bottom = 0;
      return result;
    },
    updatePopupHelpTextPosition: function (editorMainElement) {
      var editorWidth = this.editorMainElement.offsetWidth;
      var editorHeight = this.editorMainElement.offsetHeight;
      var helpTextWidth = this.helpTextElement.offsetWidth;
      var helpTextHeight = this.helpTextElement.offsetHeight;
      var editorX = ASPx.GetAbsoluteX(this.editorMainElement);
      var editorY = ASPx.GetAbsoluteY(this.editorMainElement);
      var helpTextX = 0,
        helpTextY = 0;
      var margins = this.getHelpTextMargins();
      if (
        this.position === ASPx.Position.Top ||
        this.position === ASPx.Position.Bottom
      ) {
        if (this.position === ASPx.Position.Top)
          helpTextY = editorY - margins.Bottom - helpTextHeight;
        else if (this.position === ASPx.Position.Bottom)
          helpTextY = editorY + editorHeight + margins.Top;
        if (this.hAlign === ASPxClientTextEditHelpTextHAlign.Left)
          helpTextX = editorX + margins.Left;
        else if (this.hAlign === ASPxClientTextEditHelpTextHAlign.Right)
          helpTextX = editorX + editorWidth - helpTextWidth - margins.Right;
        else if (this.hAlign === ASPxClientTextEditHelpTextHAlign.Center) {
          var editorCenterX = editorX + editorWidth / 2;
          var helpTextWidthWithMargins =
            helpTextWidth + margins.Left + margins.Right;
          helpTextX =
            editorCenterX - helpTextWidthWithMargins / 2 + margins.Left;
        }
      } else {
        if (this.position === ASPx.Position.Left)
          helpTextX = editorX - margins.Right - helpTextWidth;
        else if (this.position === ASPx.Position.Right)
          helpTextX = editorX + editorWidth + margins.Left;
        if (this.vAlign === ASPxClientTextEditHelpTextVAlign.Top)
          helpTextY = editorY + margins.Top;
        else if (this.vAlign === ASPxClientTextEditHelpTextVAlign.Bottom)
          helpTextY = editorY + editorHeight - helpTextHeight - margins.Bottom;
        else if (this.vAlign === ASPxClientTextEditHelpTextVAlign.Middle) {
          var editorCenterY = editorY + editorHeight / 2;
          var helpTextHeightWithMargins =
            helpTextHeight + margins.Top + margins.Bottom;
          helpTextY =
            editorCenterY - helpTextHeightWithMargins / 2 + margins.Top;
        }
      }
      helpTextX = helpTextX < 0 ? 0 : helpTextX;
      helpTextY = helpTextY < 0 ? 0 : helpTextY;
      ASPx.SetAbsoluteX(this.helpTextElement, helpTextX);
      ASPx.SetAbsoluteY(this.helpTextElement, helpTextY);
    },
    setHelpTextZIndex: function (hide) {
      var newZIndex = 41998 * (hide ? -1 : 1);
      if (this.helpTextElement.style.zIndex != newZIndex)
        this.helpTextElement.style.zIndex = newZIndex;
    },
    hide: function () {
      if (this.displayMode === ASPxClientTextEditHelpTextDisplayMode.Inline) {
        ASPx.SetElementDisplay(this.helpTextElement, false);
      } else {
        this.animationEnabled
          ? ASPx.AnimationHelper.fadeOut(this.helpTextElement)
          : ASPx.AnimationHelper.setOpacity(this.helpTextElement, 0);
        this.setHelpTextZIndex(true);
      }
    },
    show: function () {
      if (this.displayMode === ASPxClientTextEditHelpTextDisplayMode.Inline) {
        ASPx.SetElementDisplay(this.helpTextElement, true);
      } else {
        this.updatePopupHelpTextPosition();
        this.animationEnabled
          ? ASPx.AnimationHelper.fadeIn(this.helpTextElement)
          : ASPx.AnimationHelper.setOpacity(this.helpTextElement, 1);
        this.setHelpTextZIndex(false);
      }
    },
  });
  var ASPxOutOfRangeWarningManager = ASPx.CreateClass(null, {
    constructor: function (
      editor,
      minValue,
      maxValue,
      defaultMinValue,
      defaultMaxValue,
      outOfRangeWarningElementPosition,
      valueFormatter
    ) {
      this.editor = editor;
      this.outOfRangeWarningElementPosition = outOfRangeWarningElementPosition;
      this.minValue = minValue;
      this.maxValue = maxValue;
      this.defaultMinValue = defaultMinValue;
      this.defaultMaxValue = defaultMaxValue;
      this.minMaxValueFormatter = valueFormatter;
      this.animationDuration = 150;
      this.CreateOutOfRangeWarningElement();
    },
    SetMinValue: function (minValue) {
      this.minValue = minValue;
      this.UpdateOutOfRangeWarningElementText();
    },
    SetMaxValue: function (maxValue) {
      this.maxValue = maxValue;
      this.UpdateOutOfRangeWarningElementText();
    },
    CreateOutOfRangeWarningElement: function () {
      this.outOfRangeWarningElement = document.createElement("DIV");
      this.outOfRangeWarningElement.id = this.editor.name + "OutOfRWarn";
      ASPx.InsertElementAfter(
        this.outOfRangeWarningElement,
        this.editor.GetMainElement()
      );
      ASPx.AnimationHelper.setOpacity(this.outOfRangeWarningElement, 0);
      this.outOfRangeWarningElement.className =
        this.editor.outOfRangeWarningClassName;
      this.UpdateOutOfRangeWarningElementText();
    },
    IsValueInRange: function (value) {
      return (
        (!this.IsMinValueExists() || value >= this.minValue) &&
        (!this.IsMaxValueExists() || value <= this.maxValue)
      );
    },
    IsMinValueExists: function () {
      return (
        ASPx.IsExists(this.minValue) &&
        !isNaN(this.minValue) &&
        this.minValue !== this.defaultMinValue
      );
    },
    IsMaxValueExists: function () {
      return (
        ASPx.IsExists(this.maxValue) &&
        !isNaN(this.maxValue) &&
        this.maxValue !== this.defaultMaxValue
      );
    },
    GetFormattedTextByValue: function (value) {
      if (this.minMaxValueFormatter)
        return this.minMaxValueFormatter.Format(value);
      return value;
    },
    GetWarningText: function () {
      var textTemplate = arguments[0];
      var valueTexts = [];
      for (var i = 1; i < arguments.length; i++) {
        var valueText = this.GetFormattedTextByValue(arguments[i]);
        valueTexts.push(valueText);
      }
      return ASPx.Formatter.Format(textTemplate, valueTexts);
    },
    UpdateOutOfRangeWarningElementText: function () {
      var text = "";
      if (this.IsMinValueExists() && this.IsMaxValueExists())
        text = this.GetWarningText(
          this.editor.outOfRangeWarningMessages[0],
          this.minValue,
          this.maxValue
        );
      if (this.IsMinValueExists() && !this.IsMaxValueExists())
        text = this.GetWarningText(
          this.editor.outOfRangeWarningMessages[1],
          this.minValue
        );
      if (!this.IsMinValueExists() && this.IsMaxValueExists())
        text = this.GetWarningText(
          this.editor.outOfRangeWarningMessages[2],
          this.maxValue
        );
      ASPx.SetInnerHtml(
        this.outOfRangeWarningElement,
        "<LABEL>" + text + "</LABEL>"
      );
    },
    UpdateOutOfRangeWarningElementVisibility: function (currentValue) {
      var isValidValue =
        currentValue == null || this.IsValueInRange(currentValue);
      if (!isValidValue && !this.outOfRangeWarningElementShown)
        this.ShowOutOfRangeWarningElement();
      if (isValidValue && this.outOfRangeWarningElementShown)
        this.HideOutOfRangeWarningElement();
    },
    GetOutOfRangeWarningElementCoordinates: function () {
      var editorMainElement = this.editor.GetMainElement();
      var editorWidth = editorMainElement.offsetWidth;
      var editorHeight = editorMainElement.offsetHeight;
      var editorX = ASPx.GetAbsoluteX(editorMainElement);
      var editorY = ASPx.GetAbsoluteY(editorMainElement);
      var outOfRangeWarningElementX =
        this.outOfRangeWarningElementPosition === ASPx.Position.Right
          ? editorX + editorWidth
          : editorX;
      var outOfRangeWarningElementY =
        this.outOfRangeWarningElementPosition === ASPx.Position.Right
          ? editorY
          : editorY + editorHeight;
      outOfRangeWarningElementX =
        outOfRangeWarningElementX < 0 ? 0 : outOfRangeWarningElementX;
      outOfRangeWarningElementY =
        outOfRangeWarningElementY < 0 ? 0 : outOfRangeWarningElementY;
      return {
        x: outOfRangeWarningElementX,
        y: outOfRangeWarningElementY,
      };
    },
    ShowOutOfRangeWarningElement: function () {
      this.outOfRangeWarningElement.style.display = "inline";
      var outOfRangeWarningElementCoordinates =
        this.GetOutOfRangeWarningElementCoordinates();
      ASPx.SetAbsoluteX(
        this.outOfRangeWarningElement,
        outOfRangeWarningElementCoordinates.x
      );
      ASPx.SetAbsoluteY(
        this.outOfRangeWarningElement,
        outOfRangeWarningElementCoordinates.y
      );
      ASPx.AnimationHelper.fadeIn(
        this.outOfRangeWarningElement,
        null,
        this.animationDuration
      );
      this.outOfRangeWarningElementShown = true;
    },
    HideOutOfRangeWarningElement: function () {
      ASPx.AnimationHelper.fadeOut(
        this.outOfRangeWarningElement,
        function () {
          ASPx.SetElementDisplay(this.outOfRangeWarningElement, false);
        }.aspxBind(this),
        this.animationDuration
      );
      this.outOfRangeWarningElementShown = false;
    },
  });
  ASPx.MMMouseOut = function (name, evt) {
    var edit = ASPx.GetControlCollection().Get(name);
    if (edit != null) edit.OnMouseOut(evt);
  };
  ASPx.MMMouseOver = function (name, evt) {
    var edit = ASPx.GetControlCollection().Get(name);
    if (edit != null) edit.OnMouseOver(evt);
  };
  ASPx.MaskHintTimerProc = function () {
    var focusedEditor = ASPxClientEdit.GetFocusedEditor();
    if (
      focusedEditor != null &&
      ASPx.IsFunction(focusedEditor.MaskHintTimerProc)
    )
      focusedEditor.MaskHintTimerProc();
  };
  ASPx.ETextChanged = function (name) {
    var edit = ASPx.GetControlCollection().Get(name);
    if (edit != null) edit.OnTextChanged();
  };
  ASPx.BEClick = function (name, number) {
    var edit = ASPx.GetControlCollection().Get(name);
    if (edit != null) edit.OnButtonClick(number);
  };
  ASPx.BEClear = function (name, evt) {
    var edit = ASPx.GetControlCollection().Get(name);
    if (edit && (evt.button === 0 || ASPx.Browser.TouchUI)) {
      var requireFocus =
        !ASPx.Browser.VirtualKeyboardSupported || ASPx.Browser.MSTouchUI;
      if (requireFocus) edit.GetInputElement().focus();
      (function performOnClean() {
        if (edit.IsFocused() || !requireFocus) edit.OnClear();
        else window.setTimeout(performOnClean, 100);
      })();
    }
  };
  ASPx.SetFocusToTextEditWithDelay = function (name) {
    window.setTimeout(function () {
      var edit = ASPx.GetControlCollection().Get(name);
      if (!edit) return;
      ASPx.Browser.IE ? edit.SetCaretPosition(0) : edit.SetFocus();
    }, 500);
  };
  window.ASPxClientTextEdit = ASPxClientTextEdit;
  window.ASPxClientTextBoxBase = ASPxClientTextBoxBase;
  window.ASPxClientTextBox = ASPxClientTextBox;
  window.ASPxClientMemo = ASPxClientMemo;
  window.ASPxClientButtonEditBase = ASPxClientButtonEditBase;
  window.ASPxClientButtonEdit = ASPxClientButtonEdit;
  window.ASPxClientButtonEditClickEventArgs =
    ASPxClientButtonEditClickEventArgs;
})();

(function () {
  var ASPxClientStaticEdit = ASPx.CreateClass(ASPxClientEditBase, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.Click = new ASPxClientEvent();
    },
    OnClick: function (htmlEvent) {
      this.RaiseClick(this.GetMainElement(), htmlEvent);
    },
    RaiseClick: function (htmlElement, htmlEvent) {
      if (!this.Click.IsEmpty()) {
        var args = new ASPxClientEditClickEventArgs(htmlElement, htmlEvent);
        this.Click.FireEvent(this, args);
      }
    },
    ChangeEnabledAttributes: function (enabled) {
      this.ChangeMainElementAttributes(
        this.GetMainElement(),
        ASPx.Attr.ChangeAttributesMethod(enabled)
      );
    },
    ChangeEnabledStateItems: function (enabled) {
      ASPx.GetStateController().SetElementEnabled(
        this.GetMainElement(),
        enabled
      );
    },
    ChangeMainElementAttributes: function (element, method) {
      method(element, "onclick");
    },
    AssignEllipsisToolTipsCore: function () {
      this.AssignEllipsisToolTip(this.GetMainElement());
    },
  });
  var ASPxClientEditClickEventArgs = ASPx.CreateClass(ASPxClientEventArgs, {
    constructor: function (htmlElement, htmlEvent) {
      this.constructor.prototype.constructor.call(this);
      this.htmlElement = htmlElement;
      this.htmlEvent = htmlEvent;
    },
  });
  var ASPxClientHyperLink = ASPx.CreateClass(ASPxClientStaticEdit, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.sizingConfig.allowSetWidth = false;
      this.sizingConfig.allowSetHeight = false;
    },
    Initialize: function () {
      ASPxClientControl.prototype.Initialize.call(this);
      this.AssignEllipsisToolTips();
    },
    GetNavigateUrl: function () {
      var element = this.GetMainElement();
      if (ASPx.IsExistsElement(element)) return element.href;
      return "";
    },
    SetNavigateUrl: function (url) {
      var element = this.GetMainElement();
      if (ASPx.IsExistsElement(element)) element.href = url;
    },
    GetText: function () {
      return this.GetValue();
    },
    SetText: function (value) {
      this.SetValue(value);
    },
    ChangeMainElementAttributes: function (element, method) {
      ASPxClientStaticEdit.prototype.ChangeMainElementAttributes.call(
        this,
        element,
        method
      );
      method(element, "href");
    },
  });
  ASPxClientHyperLink.Cast = ASPxClientControl.Cast;
  var ASPxClientImageBase = ASPx.CreateClass(ASPxClientStaticEdit, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.imageWidth = "";
      this.imageHeight = "";
    },
    GetWidth: function () {
      return this.GetSize(true);
    },
    GetHeight: function () {
      return this.GetSize(false);
    },
    SetWidth: function (width) {
      this.SetSize(width, this.GetHeight());
    },
    SetHeight: function (height) {
      this.SetSize(this.GetWidth(), height);
    },
    SetSize: function (width, height) {
      this.imageWidth = width + "px";
      this.imageHeight = height + "px";
      var image = this.GetMainElement();
      if (ASPx.IsExistsElement(image))
        ASPx.ImageUtils.SetSize(image, width, height);
    },
    GetSize: function (isWidth) {
      var image = this.GetMainElement();
      if (ASPx.IsExistsElement(image))
        return ASPx.ImageUtils.GetSize(image, isWidth);
      return -1;
    },
  });
  var ASPxClientImage = ASPx.CreateClass(ASPxClientImageBase, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.emptyImageUrl = "";
      this.emptyImageToolTip = "";
      this.emptyImageWidth = "";
      this.emptyImageHeight = "";
      this.imageAlt = "";
      this.imageToolTip = "";
      this.isEmpty = false;
    },
    GetValue: function () {
      if (!this.isEmpty) {
        var image = this.GetMainElement();
        if (ASPx.IsExistsElement(image)) return image.src;
      }
      return "";
    },
    SetValue: function (value) {
      if (value == null) value = "";
      this.isEmpty = value == "";
      var image = this.GetMainElement();
      if (ASPx.IsExistsElement(image)) {
        if (image.dxShowLoadingImage)
          this.isEmpty ? this.setEmptyImage() : this.setImageUrlInternal(value);
        else image.src = value;
      }
    },
    GetImageUrl: function (url) {
      return this.GetValue();
    },
    SetImageUrl: function (url) {
      this.SetValue(url);
    },
    setEmptyImage: function () {
      this.setImageUrlInternal(this.emptyImageUrl || ASPx.EmptyImageUrl);
    },
    setImageUrlInternal: function (realSrc) {
      this.prepareRealImage();
      this.requestViaFakeImage(realSrc);
    },
    saveAndClearImageSettings: function () {
      var image = this.GetMainElement();
      if (this.isEmpty) {
        image.style.width = this.emptyImageWidth;
        image.style.height = this.emptyImageHeight;
        if (ASPx.IsExists(this.emptyImageAlt)) image.alt = this.emptyImageAlt;
        if (ASPx.IsExists(this.emptyImageToolTip))
          image.title = this.emptyImageToolTip;
      }
      this.imageSettings = {
        image: image,
        background: image.style.background,
        alt: image.alt,
        title: image.title,
      };
      image.alt = "";
      var isOldIE = ASPx.Browser.IE && ASPx.Browser.Version < 9;
      ASPx.ASPxImageLoad.removeASPxImageBackground(image, isOldIE);
    },
    showLoadingImage: function () {
      var image = this.GetMainElement();
      ASPx.AddClassNameToElement(
        image,
        ASPx.ASPxImageLoad.dxDefaultLoadingImageCssClass
      );
      if (image.dxCustomLoadingImage)
        image.style.backgroundImage = image.dxCustomLoadingImage;
    },
    prepareRealImage: function () {
      this.saveAndClearImageSettings();
      this.showLoadingImage();
      var realImage = this.GetMainElement();
      realImage.src = "";
    },
    requestViaFakeImage: function (realSrc) {
      var fakeImage = document.createElement("IMG");
      fakeImage.imageSettings = this.imageSettings;
      fakeImage.restoreRealImage = this.restoreRealImage;
      this.addFakeImageHandlers(fakeImage);
      fakeImage.src = realSrc;
    },
    addFakeImageHandlers: function (fakeImage) {
      fakeImage.onload = this.onFakeImageLoad;
      fakeImage.onabort = this.onFakeImageLoad;
      fakeImage.onerror = this.onFakeImageLoad;
    },
    onFakeImageLoad: function () {
      this.restoreRealImage();
      var realImage = this.imageSettings.image;
      ASPx.RemoveClassNameFromElement(
        realImage,
        ASPx.ASPxImageLoad.dxDefaultLoadingImageCssClass
      );
    },
    restoreRealImage: function () {
      var realImage = this.imageSettings.image;
      realImage.style.background = this.imageSettings.background;
      realImage.alt = this.imageSettings.alt;
      realImage.title = this.imageSettings.title;
      realImage.src = this.src;
    },
  });
  ASPxClientImage.Cast = ASPxClientControl.Cast;
  var ASPxClientLabel = ASPx.CreateClass(ASPxClientStaticEdit, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.sizingConfig.allowSetWidth = false;
      this.sizingConfig.allowSetHeight = false;
      this.accessibilityAssociatedElementID = "";
      this.accessibilityAssociatedControlName = "";
    },
    Initialize: function () {
      ASPxClientControl.prototype.Initialize.call(this);
      this.AssignEllipsisToolTips();
      if (this.accessibilityAssociatedElementID !== "")
        this.SetAccessibilityAssociating();
    },
    GetAssociatedControl: function () {
      var endIndex =
        this.accessibilityAssociatedElementID.indexOf(
          this.accessibilityAssociatedControlName
        ) + this.accessibilityAssociatedControlName.length;
      var associatedControlName = this.accessibilityAssociatedElementID.slice(
        0,
        endIndex
      );
      return ASPx.GetControlCollection().Get(associatedControlName);
    },
    SetAccessibilityAssociating: function () {
      var accessibilityAssociatedElement = ASPx.GetElementById(
        this.accessibilityAssociatedElementID
      );
      if (!accessibilityAssociatedElement) return;
      var clickHandler = function (evt) {
        var associatedControl = this.GetAssociatedControl();
        if (associatedControl && associatedControl.OnAssociatedLabelClick)
          associatedControl.OnAssociatedLabelClick(evt);
        else accessibilityAssociatedElement.click();
      }.aspxBind(this);
      ASPx.Evt.AttachEventToElement(
        this.GetMainElement(),
        "click",
        clickHandler
      );
      var isExistsAriaLabel = !!ASPx.Attr.GetAttribute(
        accessibilityAssociatedElement,
        "aria-label"
      );
      ASPx.Attr.SetAttribute(
        accessibilityAssociatedElement,
        isExistsAriaLabel ? "aria-describedby" : "aria-labelledby",
        this.GetMainElement().id
      );
    },
    GetValue: function () {
      var element = this.GetMainElement();
      if (ASPx.IsExistsElement(element)) return element.innerHTML;
    },
    SetValue: function (value) {
      if (value == null) value = "";
      var element = this.GetMainElement();
      if (ASPx.IsExistsElement(element)) element.innerHTML = value;
    },
    SetVisible: function (visible) {
      if (this.clientVisible != visible) {
        this.clientVisible = visible;
        var element = this.GetMainElement();
        if (!visible) element.style.display = "none";
        else if (
          (element.style.width != "" || element.style.height != "") &&
          !ASPx.Browser.NetscapeFamily
        )
          element.style.display = "inline-block";
        else element.style.display = "";
      }
    },
    GetText: function () {
      return this.GetValue();
    },
    SetText: function (value) {
      this.SetValue(value);
    },
    ChangeMainElementAttributes: function (element, method) {
      ASPxClientStaticEdit.prototype.ChangeMainElementAttributes.call(
        this,
        element,
        method
      );
      method(element, "htmlFor");
    },
  });
  ASPxClientLabel.Cast = ASPxClientControl.Cast;
  ASPx.SEClick = function (name, evt) {
    var edit = ASPx.GetControlCollection().Get(name);
    if (edit != null) {
      edit.OnClick(evt);
      return evt.returnValue;
    }
  };
  ASPx.SELoad = function (evt) {
    var image = ASPx.Evt.GetEventSource(evt);
    if (!image.dxLoadingImageBackground)
      image.dxLoadingImageBackground = image.style.background;
    image.style.background = "";
  };
  window.ASPxClientStaticEdit = ASPxClientStaticEdit;
  window.ASPxClientEditClickEventArgs = ASPxClientEditClickEventArgs;
  window.ASPxClientHyperLink = ASPxClientHyperLink;
  window.ASPxClientImageBase = ASPxClientImageBase;
  window.ASPxClientImage = ASPxClientImage;
  window.ASPxClientLabel = ASPxClientLabel;
})();
(function () {
  var ASPxClientLoadingPanel = ASPx.CreateClass(ASPxClientControl, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.containerElementID = "";
      this.containerElement = null;
      this.horizontalOffset = 0;
      this.verticalOffset = 0;
      this.isTextEmpty = false;
      this.showImage = true;
      this.shown = false;
      this.currentoffsetElement = null;
      this.currentX = null;
      this.currentY = null;
    },
    Initialize: function () {
      if (this.containerElementID != "")
        this.containerElement = ASPx.GetElementById(this.containerElementID);
      this.constructor.prototype.Initialize.call(this);
    },
    SetCurrentShowArguments: function (offsetElement, x, y) {
      if (offsetElement == null) offsetElement = this.containerElement;
      if (offsetElement && !ASPx.IsValidElement(offsetElement))
        offsetElement = ASPx.GetElementById(offsetElement.id);
      if (offsetElement == null) offsetElement = document.body;
      this.currentoffsetElement = offsetElement;
      this.currentX = x;
      this.currentY = y;
    },
    ResetCurrentShowArguments: function () {
      this.currentoffsetElement = null;
      this.currentX = null;
      this.currentY = null;
    },
    SetLoadingPanelPosAndSize: function () {
      var element = this.GetMainElement();
      this.SetLoadingPanelLocation(
        this.currentoffsetElement,
        element,
        this.currentX,
        this.currentY,
        this.horizontalOffset,
        this.verticalOffset
      );
    },
    SetLoadingDivPosAndSize: function () {
      var element = this.GetLoadingDiv();
      if (element != null) {
        ASPx.SetElementDisplay(element, true);
        this.SetLoadingDivBounds(this.currentoffsetElement, element);
      }
    },
    ShowInternal: function (offsetElement, x, y) {
      this.SetCurrentShowArguments(offsetElement, x, y);
      var element = this.GetMainElement();
      ASPx.SetElementDisplay(element, true);
      this.SetLoadingPanelPosAndSize();
      this.SetLoadingDivPosAndSize();
      ASPx.GetControlCollection().AdjustControls(element);
      this.shown = true;
    },
    Show: function () {
      this.ShowInternal(null);
    },
    ShowInElement: function (htmlElement) {
      if (htmlElement) this.ShowInternal(htmlElement);
    },
    ShowInElementByID: function (id) {
      var htmlElement = ASPx.GetElementById(id);
      this.ShowInElement(htmlElement);
    },
    ShowAtPos: function (x, y) {
      this.ShowInternal(null, x, y);
    },
    SetText: function (text) {
      this.isTextEmpty = text == null || text == "";
      var textLabel = this.GetTextLabel();
      if (textLabel) textLabel.innerHTML = this.isTextEmpty ? "&nbsp;" : text;
    },
    GetText: function () {
      return this.isTextEmpty ? "" : this.GetTextLabel().innerHTML;
    },
    Hide: function () {
      var element = this.GetMainElement();
      ASPx.SetElementDisplay(element, false);
      element = this.GetLoadingDiv();
      if (element != null) {
        ASPx.SetStyles(element, { width: 1, height: 1 });
        ASPx.SetElementDisplay(element, false);
      }
      this.ResetCurrentShowArguments();
      this.shown = false;
    },
    GetTextLabel: function () {
      return this.GetChildElement("TL");
    },
    GetVisible: function () {
      return ASPx.GetElementDisplay(this.GetMainElement());
    },
    SetVisible: function (visible) {
      if (visible && !this.IsVisible()) this.Show();
      else if (!visible && this.IsVisible()) this.Hide();
    },
    BrowserWindowResizeSubscriber: function () {
      return true;
    },
    OnBrowserWindowResize: function () {
      if (this.shown) {
        this.SetLoadingPanelPosAndSize();
        this.SetLoadingDivPosAndSize();
      }
    },
  });
  ASPxClientLoadingPanel.Cast = ASPxClientControl.Cast;
  window.ASPxClientLoadingPanel = ASPxClientLoadingPanel;
})();
(function () {
  var ASPxClientButton = ASPx.CreateClass(ASPxClientControl, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.isASPxClientButton = true;
      this.allowFocus = true;
      this.autoPostBackFunction = null;
      this.causesValidation = true;
      this.checked = false;
      this.clickLocked = false;
      this.groupName = "";
      this.focusElementSelected = false;
      this.pressed = false;
      this.useSubmitBehavior = true;
      this.validationGroup = "";
      this.validationContainerID = null;
      this.validateInvisibleEditors = false;
      this.originalWidth = null;
      this.originalHeight = null;
      this.needUpdateBounds = true;
      this.isTextEmpty = false;
      this.CheckedChanged = new ASPxClientEvent();
      this.GotFocus = new ASPxClientEvent();
      this.LostFocus = new ASPxClientEvent();
      this.Click = new ASPxClientEvent();
    },
    InlineInitialize: function () {
      var mainElement = this.GetMainElement();
      this.originalWidth = mainElement.style.width;
      this.originalHeight = mainElement.style.height;
      ASPxClientControl.prototype.InlineInitialize.call(this);
      this.InitializeElementIDs();
      this.InitializeEvents();
      this.InitializeEnabled();
      this.InitializeChecked();
      if (this.IsLink()) this.InitializeLink();
      this.PreventButtonImageDragging();
      this.needUpdateBounds =
        ASPx.Browser.Safari ||
        ASPx.GetCurrentStyle(mainElement).display.indexOf("table") === -1;
      if (this.needUpdateBounds)
        mainElement.className = mainElement.className.replace("dxbTSys", "");
      else {
        var contentElement = this.GetContentDiv();
        if (contentElement)
          contentElement.style.verticalAlign = mainElement.style.verticalAlign;
      }
    },
    InitializeElementIDs: function () {
      var mainElement = this.GetMainElement();
      var contentElement = ASPx.GetNodeByTagName(mainElement, "DIV", 0);
      if (contentElement) contentElement.id = this.name + "_CD";
      var imageElement = ASPx.GetNodeByTagName(mainElement, "IMG", 0);
      if (imageElement) imageElement.id = this.name + "Img";
    },
    InitializeEnabled: function () {
      this.SetEnabledInternal(this.clientEnabled, true);
    },
    InitializeChecked: function () {
      this.SetCheckedInternal(this.checked, true);
    },
    InitializeLink: function () {
      var mainElement = this.GetMainElement();
      if (this.enabled) mainElement.href = "javascript:;";
      if (!this.allowFocus) mainElement.style.outline = 0;
      if (!this.GetTextContainer()) mainElement.style.fontSize = "0pt";
    },
    InitializeEvents: function () {
      if (!this.isNative && !this.IsLink()) {
        var element = this.GetInternalButton();
        if (element) element.onfocus = null;
        var textControl = this.GetTextControl();
        if (textControl) {
          if (ASPx.Browser.IE)
            ASPx.Evt.AttachEventToElement(
              textControl,
              "mouseup",
              ASPx.Selection.Clear
            );
          ASPx.Evt.PreventElementDragAndSelect(textControl, false);
        }
      }
      this.onClick = function (evt) {
        var processOnServer = ASPx.BClick(this.name, evt);
        if (!processOnServer) ASPx.Evt.PreventEvent(evt);
        return processOnServer;
      }.aspxBind(this);
      this.onImageMoseDown = function () {
        var el = ASPx.GetFocusedElement();
        if (el) el.blur();
      };
      this.onGotFocus = function () {
        this.OnFocus();
      }.aspxBind(this);
      this.onLostFocus = function () {
        this.OnLostFocus();
      }.aspxBind(this);
      this.onKeyUp = function (evt) {
        this.OnKeyUp(evt);
      }.aspxBind(this);
      this.onKeyDown = function (evt) {
        this.OnKeyDown(evt);
      }.aspxBind(this);
      if (!this.isNative && !this.IsLink()) {
        this.AttachNativeHandlerToMainElement("focus", "SetFocus");
        this.AttachNativeHandlerToMainElement("click", "DoClick");
      }
    },
    AdjustControlCore: function () {
      if (this.isNative || this.IsLink()) return;
      var buttonImage = this.GetButtonImage();
      if (
        buttonImage &&
        buttonImage.offsetHeight === 0 &&
        buttonImage.offsetWidth === 0
      )
        buttonImage.onload = function () {
          this.UpdateSize();
        }.aspxBind(this);
      else this.UpdateSize();
    },
    UpdateSize: function () {
      if (this.needUpdateBounds) {
        this.UpdateWidth();
        this.UpdateHeight();
      } else this.CorrectWrappedText(this.GetContentDiv, "Text", true);
    },
    UpdateHeight: function () {
      if (
        this.isNative ||
        this.IsLink() ||
        this.originalHeight === null ||
        ASPx.IsPercentageSize(this.originalHeight)
      )
        return;
      var height;
      var mainElement = this.GetMainElement();
      var contentDiv = this.GetContentDiv();
      var borderAndPadding =
        ASPx.GetTopBottomBordersAndPaddingsSummaryValue(mainElement);
      var contentHasExcessiveHeight =
        contentDiv.offsetHeight > mainElement.offsetHeight - borderAndPadding;
      var needSetAutoHeight =
        !this.originalHeight ||
        (ASPx.Browser.Safari && contentHasExcessiveHeight);
      if (needSetAutoHeight) {
        mainElement.style.height = "";
        height = mainElement.offsetHeight - borderAndPadding;
      } else height = ASPx.PxToInt(this.originalHeight) - borderAndPadding;
      if (height) {
        mainElement.style.height = height + "px";
        if (contentDiv && contentDiv.offsetHeight > 0) {
          var contentDivCurrentStyle = ASPx.GetCurrentStyle(contentDiv);
          var paddingTop = parseInt(contentDivCurrentStyle.paddingTop) || 0;
          var paddingBottom =
            parseInt(contentDivCurrentStyle.paddingBottom) || 0;
          var clientHeightDiff = height - contentDiv.offsetHeight;
          var verticalAlign = ASPx.GetCurrentStyle(mainElement).verticalAlign;
          if (verticalAlign == "top")
            paddingBottom = paddingBottom + clientHeightDiff;
          else if (verticalAlign == "bottom")
            paddingTop = paddingTop + clientHeightDiff;
          else {
            var halfClientHeightDiff = Math.floor(clientHeightDiff / 2);
            paddingTop = paddingTop + halfClientHeightDiff;
            paddingBottom =
              paddingBottom + (clientHeightDiff - halfClientHeightDiff);
          }
          contentDiv.style.paddingTop =
            (paddingTop > 0 ? paddingTop : 0) + "px";
          contentDiv.style.paddingBottom =
            (paddingBottom > 0 ? paddingBottom : 0) + "px";
        }
      }
    },
    UpdateWidth: function () {
      if (this.isNative || this.IsLink() || this.originalWidth === null) return;
      if (!ASPx.IsPercentageSize(this.originalWidth)) {
        var mainElement = this.GetMainElement();
        var borderAndPadding =
          ASPx.GetLeftRightBordersAndPaddingsSummaryValue(mainElement);
        if (this.originalWidth && ASPx.IsTextWrapped(this.GetTextContainer()))
          mainElement.style.width =
            ASPx.PxToInt(this.originalWidth) - borderAndPadding + "px";
        else mainElement.style.width = "";
        var width = mainElement.offsetWidth - borderAndPadding;
        if (
          this.originalWidth &&
          width < ASPx.PxToInt(this.originalWidth) - borderAndPadding
        )
          width = ASPx.PxToInt(this.originalWidth) - borderAndPadding;
        if (width) mainElement.style.width = (width > 0 ? width : 0) + "px";
      }
      this.CorrectWrappedText(this.GetContentDiv, "Text", true);
    },
    GetAdjustedSizes: function () {
      var sizes = ASPxClientControl.prototype.GetAdjustedSizes.call(this);
      var image = this.GetButtonImage();
      if (image) {
        sizes.imageWidth = image.offsetWidth;
        sizes.imageHeight = image.offsetHeight;
      }
      return sizes;
    },
    PreventButtonImageDragging: function () {
      ASPx.Evt.PreventImageDragging(this.GetButtonImage());
    },
    AttachNativeHandlerToMainElement: function (
      handlerName,
      correspondingMethodName
    ) {
      var mainElement = this.GetMainElement();
      if (!ASPx.IsExistsElement(mainElement)) return;
      mainElement[handlerName] = function () {
        _aspxBCallButtonMethod(this.name, correspondingMethodName);
      }.aspxBind(this);
    },
    GetContentDiv: function () {
      return this.GetChildElement("CD");
    },
    GetButtonImage: function () {
      return ASPx.CacheHelper.GetCachedElement(
        this,
        "buttonImage",
        function () {
          return ASPx.GetNodeByTagName(this.GetMainElement(), "IMG", 0);
        }
      );
    },
    GetInternalButton: function () {
      return ASPx.CacheHelper.GetCachedElement(
        this,
        "internalButton",
        function () {
          return this.isNative || this.IsLink()
            ? this.GetMainElement()
            : ASPx.GetNodeByTagName(this.GetMainElement(), "INPUT", 0);
        }
      );
    },
    GetTextContainer: function () {
      return ASPx.CacheHelper.GetCachedElement(
        this,
        "textContainer",
        function () {
          if (this.isNative) return this.GetMainElement();
          else {
            var textElement = this.IsLink()
              ? this.GetMainElement()
              : this.GetContentDiv();
            return ASPx.GetNodeByTagName(textElement, "SPAN", 0);
          }
        }
      );
    },
    GetTextControl: function () {
      return ASPx.CacheHelper.GetCachedElement(
        this,
        "textControl",
        function () {
          var element = ASPx.GetParentByTagName(this.GetContentDiv(), "DIV");
          if (!ASPx.IsExistsElement(element) || element.id == this.name)
            element = this.GetContentDiv();
          return element;
        }
      );
    },
    IsLink: function () {
      if (this.GetMainElement()) return this.GetMainElement().tagName === "A";
      return false;
    },
    IsHovered: function () {
      var hoverElement = this.GetMainElement();
      return ASPx.GetStateController().currentHoverItemName == hoverElement.id;
    },
    SetEnabledInternal: function (enabled, initialization) {
      if (!this.enabled) return;
      if (!initialization || !enabled) this.ChangeEnabledStateItems(enabled);
      this.ChangeEnabledAttributes(enabled);
    },
    ChangeEnabledAttributes: function (enabled) {
      var element = this.GetInternalButton();
      if (element) {
        element.disabled = !enabled;
        if (this.IsLink()) {
          var method = ASPx.Attr.ChangeAttributesMethod(enabled);
          method(this.GetMainElement(), "href");
        }
      }
      this.ChangeEnabledEventsAttributes(ASPx.Attr.ChangeEventsMethod(enabled));
    },
    ChangeEnabledEventsAttributes: function (method) {
      var element = this.GetMainElement();
      method(element, "click", this.onClick);
      if (this.allowFocus) {
        if (!this.isNative && !this.IsLink())
          element = this.GetInternalButton();
        if (element) {
          method(element, "focus", this.onGotFocus);
          method(element, "blur", this.onLostFocus);
          if (!this.isNative && !this.IsLink()) {
            method(element, "keyup", this.onKeyUp);
            method(element, "blur", this.onKeyUp);
            method(element, "keydown", this.onKeyDown);
          }
        }
        if (ASPx.Browser.Firefox) {
          var image = this.GetButtonImage();
          if (image) method(image, "mousedown", this.onImageMoseDown);
        }
      }
    },
    ChangeEnabledStateItems: function (enabled) {
      if (this.isNative) return;
      ASPx.GetStateController().SetElementEnabled(
        this.GetMainElement(),
        enabled
      );
      this.UpdateFocusedStyle();
    },
    RequiredPreventDoublePostback: function () {
      return ASPx.Browser.Firefox && !this.isNative;
    },
    OnFocus: function () {
      if (!this.allowFocus) return false;
      this.focused = true;
      if (this.isInitialized) this.RaiseFocus();
      this.UpdateFocusedStyle();
    },
    OnLostFocus: function () {
      if (!this.allowFocus) return false;
      this.focused = false;
      if (this.isInitialized) this.RaiseLostFocus();
      this.UpdateFocusedStyle();
    },
    CauseValidation: function () {
      if (this.causesValidation && typeof ASPxClientEdit != "undefined")
        return this.validationContainerID != null
          ? ASPxClientEdit.ValidateEditorsInContainerById(
              this.validationContainerID,
              this.validationGroup,
              this.validateInvisibleEditors
            )
          : ASPxClientEdit.ValidateGroup(
              this.validationGroup,
              this.validateInvisibleEditors
            );
      else return true;
    },
    OnClick: function (evt) {
      if (this.clickLocked) return true;
      if (
        this.checked &&
        this.groupName != "" &&
        this.GetCheckedGroupList().length > 1
      )
        return;
      this.SetFocus();
      var isValid = this.CauseValidation();
      var processOnServer = this.autoPostBack;
      if (this.groupName != "") {
        if (this.GetCheckedGroupList().length == 1)
          this.SetCheckedInternal(!this.checked, false);
        else {
          this.SetCheckedInternal(true, false);
          this.ClearButtonGroupChecked(true);
        }
        processOnServer = this.RaiseCheckedChanged();
        if (processOnServer && isValid) this.SendPostBack("CheckedChanged");
      }
      var params = this.RaiseClick();
      if (evt && params.cancelEventAndBubble)
        ASPx.Evt.PreventEventAndBubble(evt);
      if (params.processOnServer && isValid) {
        var requiredPreventDoublePostback =
          this.RequiredPreventDoublePostback();
        var postponePostback = ASPx.Browser.AndroidMobilePlatform;
        if (requiredPreventDoublePostback || postponePostback)
          window.setTimeout(
            function () {
              _aspxBCallButtonMethod(this.name, "SendPostBack", "Click");
            }.aspxBind(this),
            0
          );
        else this.SendPostBack("Click");
        return !requiredPreventDoublePostback;
      }
      return false;
    },
    OnKeyUp: function (evt) {
      if (this.pressed) this.SetUnpressed();
    },
    OnKeyDown: function (evt) {
      if (evt.keyCode == ASPx.Key.Enter || evt.keyCode == ASPx.Key.Space)
        this.SetPressed();
    },
    GetChecked: function () {
      return this.groupName != "" ? this.checked : false;
    },
    GetCheckedGroupList: function () {
      var result = [];
      ASPx.GetControlCollection().ForEachControl(function (control) {
        if (
          ASPx.Ident.IsASPxClientButton(control) &&
          control.groupName == this.groupName &&
          !control.IsDOMDisposed()
        )
          result.push(control);
      }, this);
      return result;
    },
    ClearButtonGroupChecked: function (raiseCheckedChanged) {
      var list = this.GetCheckedGroupList();
      for (var i = 0; i < list.length; i++) {
        if (list[i] != this && list[i].checked) {
          list[i].SetCheckedInternal(false, false);
          if (raiseCheckedChanged) list[i].RaiseCheckedChanged();
        }
      }
    },
    ApplyCheckedStyle: function () {
      var stateController = ASPx.GetStateController();
      if (this.IsHovered()) stateController.SetCurrentHoverElement(null);
      stateController.SelectElementBySrcElement(this.GetMainElement());
    },
    ApplyUncheckedStyle: function () {
      var stateController = ASPx.GetStateController();
      if (this.IsHovered()) stateController.SetCurrentHoverElement(null);
      stateController.DeselectElementBySrcElement(this.GetMainElement());
    },
    SetCheckedInternal: function (checked, initialization) {
      if ((initialization && checked) || this.checked != checked) {
        this.checked = checked;
        if (checked) this.ApplyCheckedStyle();
        else this.ApplyUncheckedStyle();
      }
    },
    UpdateStateObject: function () {
      if (this.groupName != "")
        this.UpdateStateObjectWithObject({ checked: this.checked });
    },
    GetStateHiddenFieldName: function () {
      return this.uniqueID + "$State";
    },
    ApplyPressedStyle: function () {
      ASPx.GetStateController().OnMouseDownOnElement(this.GetMainElement());
    },
    ApplyUnpressedStyle: function () {
      ASPx.GetStateController().OnMouseUpOnElement(this.GetMainElement());
    },
    SetPressed: function () {
      this.pressed = true;
      this.ApplyPressedStyle();
    },
    SetUnpressed: function () {
      this.pressed = false;
      this.ApplyUnpressedStyle();
    },
    SetFocus: function () {
      if (!this.allowFocus || this.focused) return;
      var element = this.GetInternalButton();
      if (element) {
        var hiddenInternalButtonRequiresVisibilityToGetFocused =
          ASPx.Browser.WebKitFamily && !this.isNative && !this.IsLink();
        if (hiddenInternalButtonRequiresVisibilityToGetFocused)
          ASPxClientButton.MakeHiddenElementFocusable(element);
        if (ASPx.IsFocusable(element) && ASPx.GetActiveElement() != element)
          element.focus();
        if (hiddenInternalButtonRequiresVisibilityToGetFocused)
          ASPxClientButton.RestoreHiddenElementAppearance(element);
      }
    },
    ApplyFocusedStyle: function () {
      if (this.focusElementSelected) return;
      if (typeof ASPx.GetStateController != "undefined")
        ASPx.GetStateController().SelectElementBySrcElement(
          this.GetContentDiv()
        );
      this.focusElementSelected = true;
    },
    ApplyUnfocusedStyle: function () {
      if (!this.focusElementSelected) return;
      if (typeof ASPx.GetStateController != "undefined")
        ASPx.GetStateController().DeselectElementBySrcElement(
          this.GetContentDiv()
        );
      this.focusElementSelected = false;
    },
    UpdateFocusedStyle: function () {
      if (this.isNative || this.IsLink()) return;
      if (this.enabled && this.clientEnabled && this.allowFocus && this.focused)
        this.ApplyFocusedStyle();
      else this.ApplyUnfocusedStyle();
    },
    SendPostBack: function (postBackArg) {
      if (!this.enabled || !this.clientEnabled) return;
      var arg = postBackArg || "";
      if (this.autoPostBackFunction) this.autoPostBackFunction(arg);
      else if (!this.useSubmitBehavior || this.IsLink())
        ASPxClientControl.prototype.SendPostBack.call(this, arg);
      if (this.useSubmitBehavior && !this.isNative) this.ClickInternalButton();
    },
    ClickInternalButton: function () {
      var element = this.GetInternalButton();
      if (element) {
        this.clickLocked = true;
        if (ASPx.Browser.NetscapeFamily) this.CreateUniqueIDCarrier();
        var postHandler = ASPx.GetPostHandler();
        postHandler.SetLastSubmitElementName(element.name);
        ASPx.Evt.DoElementClick(element);
        postHandler.SetLastSubmitElementName(null);
        if (ASPx.Browser.NetscapeFamily) this.RemoveUniqueIDCarrier();
        this.clickLocked = false;
      }
    },
    CreateUniqueIDCarrier: function () {
      var name = this.uniqueID;
      var id = this.GetUniqueIDCarrierID();
      var field = ASPx.CreateHiddenField(name, id);
      var form = this.GetParentForm();
      if (form) form.appendChild(field);
    },
    RemoveUniqueIDCarrier: function () {
      var field = document.getElementById(this.GetUniqueIDCarrierID());
      if (field) field.parentNode.removeChild(field);
    },
    GetUniqueIDCarrierID: function () {
      return this.uniqueID + "_UIDC";
    },
    DoClick: function () {
      if (!this.enabled || !this.clientEnabled) return;
      var button =
        this.isNative || this.IsLink()
          ? this.GetMainElement()
          : this.GetInternalButton();
      if (button) ASPx.Evt.DoElementClick(button);
      else this.OnClick();
    },
    GetChecked: function () {
      return this.checked;
    },
    SetChecked: function (checked) {
      this.SetCheckedInternal(checked, false);
      this.ClearButtonGroupChecked(false);
    },
    GetText: function () {
      if (!this.isTextEmpty)
        return this.isNative
          ? this.GetTextContainer().value
          : this.GetTextContainer().innerHTML;
      return "";
    },
    SetText: function (text) {
      this.isTextEmpty = text == null || text == "";
      var textContainer = this.GetTextContainer();
      if (textContainer) {
        if (this.isNative) textContainer.value = text != null ? text : "";
        else {
          var value = this.isTextEmpty ? "&nbsp;" : text;
          textContainer.innerHTML = value;
          var element = this.GetInternalButton();
          if (element) element.value = value;
          if (
            this.clientVisible &&
            ASPx.Browser.IE &&
            ASPx.Browser.Version >= 9
          )
            ASPx.SetElementDisplay(this.GetMainElement(), true);
        }
        this.UpdateSize();
      }
    },
    GetImageUrl: function () {
      var img = this.GetButtonImage();
      return img ? img.src : "";
    },
    SetImageUrl: function (url) {
      var img = this.GetButtonImage();
      if (img) {
        img.src = url;
        this.UpdateSize();
      }
    },
    SetEnabled: function (enabled) {
      if (this.clientEnabled != enabled) {
        if (!enabled && this.focused) this.OnLostFocus();
        this.clientEnabled = enabled;
        this.SetEnabledInternal(enabled, false);
      }
    },
    GetEnabled: function () {
      return this.enabled && this.clientEnabled;
    },
    Focus: function () {
      this.SetFocus();
    },
    RaiseCheckedChanged: function () {
      var processOnServer =
        this.autoPostBack || this.IsServerEventAssigned("CheckedChanged");
      if (!this.CheckedChanged.IsEmpty()) {
        var args = new ASPxClientProcessingModeEventArgs(processOnServer);
        this.CheckedChanged.FireEvent(this, args);
        processOnServer = args.processOnServer;
      }
      return processOnServer;
    },
    RaiseFocus: function () {
      if (!this.GotFocus.IsEmpty()) {
        var args = new ASPxClientEventArgs();
        this.GotFocus.FireEvent(this, args);
      }
    },
    RaiseLostFocus: function () {
      if (!this.LostFocus.IsEmpty()) {
        var args = new ASPxClientEventArgs();
        this.LostFocus.FireEvent(this, args);
      }
    },
    RaiseClick: function () {
      var processOnServer =
        this.autoPostBack || this.IsServerEventAssigned("Click");
      var cancelEventAndBubble = false;
      if (!this.Click.IsEmpty()) {
        var args = new ASPxClientButtonClickEventArgs(
          processOnServer,
          cancelEventAndBubble
        );
        this.Click.FireEvent(this, args);
        cancelEventAndBubble = args.cancelEventAndBubble;
        processOnServer = args.processOnServer;
      }
      return {
        processOnServer: processOnServer,
        cancelEventAndBubble: cancelEventAndBubble,
      };
    },
  });
  var ASPxClientButtonClickEventArgs = ASPx.CreateClass(
    ASPxClientProcessingModeEventArgs,
    {
      constructor: function (processOnServer, cancelEventAndBubble) {
        this.constructor.prototype.constructor.call(this, processOnServer);
        this.cancelEventAndBubble = cancelEventAndBubble;
      },
    }
  );
  ASPxClientButton.Cast = ASPxClientControl.Cast;
  ASPxClientButton.MakeHiddenElementFocusable = function (element) {
    element.__dxHiddenElementState = {
      parentDisplay: element.parentNode.style.display,
      height: element.style.height,
      width: element.style.width,
    };
    element.parentNode.style.display = "block";
    element.style.height = "1px";
    element.style.width = "1px";
  };
  ASPxClientButton.RestoreHiddenElementAppearance = function (element) {
    var state = element.__dxHiddenElementState;
    element.parentNode.style.display = state.parentDisplay;
    element.style.height = state.height;
    element.style.width = state.width;
    delete element.__dxHiddenElementState;
  };
  ASPx.Ident.IsASPxClientButton = function (obj) {
    return !!obj.isASPxClientButton;
  };
  function _aspxBCallButtonMethod(name, methodName, arg) {
    var button = ASPx.GetControlCollection().Get(name);
    if (button != null) button[methodName](arg);
  }
  ASPx.BClick = function (name, evt) {
    var button = ASPx.GetControlCollection().Get(name);
    if (button != null) return button.OnClick(evt);
  };
  window.ASPxClientButton = ASPxClientButton;
})();

(function () {
  var ASPxClientCallback = ASPx.CreateClass(ASPxClientComponent, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.CallbackComplete = new ASPxClientEvent();
    },
    SendCallback: function (parameter) {
      this.PerformCallback(parameter);
    },
    PerformCallback: function (parameter) {
      if (!ASPx.IsExists(parameter)) parameter = "";
      this.CreateCallback(parameter);
    },
    OnCallback: function (result) {
      var args = new ASPxClientCallbackCompleteEventArgs(
        result.parameter,
        result.data
      );
      this.CallbackComplete.FireEvent(this, args);
    },
  });
  ASPxClientCallback.Cast = ASPxClientControl.Cast;
  var ASPxClientCallbackCompleteEventArgs = ASPx.CreateClass(
    ASPxClientEventArgs,
    {
      constructor: function (parameter, result) {
        this.constructor.prototype.constructor.call(this);
        this.parameter = parameter;
        this.result = result;
      },
    }
  );
  window.ASPxClientCallback = ASPxClientCallback;
  window.ASPxClientCallbackCompleteEventArgs =
    ASPxClientCallbackCompleteEventArgs;
})();

(function () {
  var Constants = {
    QueryParamNames: {
      PROGRESS_INFO: "DXProgressInfo",
      UPLOADING_CALLBACK: "DXUploadingCallback",
      HELPER_UPLOADING_CALLBACK: "DXHelperUploadingCallback",
      CANCEL_UPLOAD: "DXFakeQueryParam",
      PROGRESS_HANDLER: "DXProgressHandlerKey",
    },
    DEFAULT_PACKET_SIZE: 200000,
    ERROR_TEXT_RESPONSE_PREFIX: "DXER:",
    INPUT_ZINDEX: 29999,
    FIREFOX_FOLDER_MAX_SIZE: 16384,
  };
  var IdSuffixes = {
    Input: {
      FileInput: "_Input",
      FileInputRow: "_FI",
      FileFakeInput: "_FakeInput",
      FakeFocusInput: "_FFI",
      UploadInputsTable: "_UploadInputs",
      TextBoxCell: "_TextBox",
      AddButtonsSeparator: "_AddUploadR",
      AddUploadButtonPanelRow: "_AddUploadPanelR",
      ButtonCell: {
        Add: "_Add",
        Upload: "_Upload",
        Browse: "_Browse",
        Remove: "_Remove",
        Cancel: "_Cancel",
        Clear: "_ClearBox",
        ClearImg: "Img",
      },
      FileList: {
        List: "_FileList",
        Row: "_FileR",
        RemoveRowButton: "_RemoveRow",
        ProgressControl: "_FL_Progress",
      },
    },
    SL: {
      UploadHelper: "_SLUploadHelper",
      UploadHost: "_SLUploadHost",
      ErrorTextResponsePrefix: "DXER:",
    },
    Progress: {
      Panel: "_ProgressPanel",
      Control: "_UCProgress",
    },
    Error: {
      Row: "_ErrR",
      RowTemplate: "_ErrRRT",
      Div: "_CErr",
      PlatformErrorTable: "_PlatformErrorPanel",
    },
    Upload: {
      IFrame: "_UploadIframe",
    },
  };
  var CSSClasses = {
    ErrorTextResponsePrefix: "DXER:",
    BrowseButtonCell: "dxBB",
    ClearButtonCell: "dxCB",
    RemoveButtonCell: "dxRB",
    BrowseButtonFocus: "dxbf",
    FITextBoxHoverDocument: "_dxFITextBoxHover",
    FIButtonHoverDocument: "_dxFIButtonHover",
    SeparatorRow: "dxucSR",
    HiddenUI: "dxucHidden",
    Textbox: "dxTB",
    TextboxInput: "dxTI",
    TextboxFakeInput: "dxTF",
    FileList: {
      List: "dxucFileList",
      NameCell: "dxucNameCell",
      RemoveButtonCell: "dxRB",
      ProgressBar: "dxucFL-Progress",
      ProgressBarCell: "dxucBarCell",
      State: {
        Pending: "dxuc-pending",
        Uploading: "dxuc-uploading",
        Complete: "dxuc-complete",
      },
    },
    DropZone: {
      Inline: "dxucInlineDropZoneSys",
      InlineHidden: "dxucIZ-hidden",
      HasExternalAnchor: "hasExternalAnchor",
    },
  };
  var ASPxEmptyRefreshArgs = {
    fileInfos: [],
    forceClear: true,
  };
  var ASPxUploadErrorTypes = {
    Common: 0,
    Platform: 1,
    Validation: 2,
    InputRowError: 3,
  };
  var ASPxClientUploadControl = ASPx.CreateClass(ASPxClientControl, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.settingsID = "";
      this.signature = "";
      this.validationSettings = this.validationSettings || {};
      this.isInCallback = false;
      this.advancedModeEnabled = false;
      this.clientEnabled = true;
      this.fileInfosCache = new ASPxFileInfoCache();
      this.templateDisabledRemoveItem = null;
      this.dropZoneAnimationType = "Fade";
      aspxGetUploadControlCollection().Add(this);
      this.FileUploadComplete = new ASPxClientEvent();
      this.FilesUploadComplete = new ASPxClientEvent();
      this.FileUploadStart = new ASPxClientEvent();
      this.FilesUploadStart = new ASPxClientEvent();
      this.TextChanged = new ASPxClientEvent();
      this.UploadingProgressChanged = new ASPxClientEvent();
      this.FileInputCountChanged = new ASPxClientEvent();
      this.DropZoneEnter = new ASPxClientEvent();
      this.DropZoneLeave = new ASPxClientEvent();
    },
    Initialize: function () {
      if (!this.GetMainElement()) return;
      this.InitializeHandlers();
      this.AdjustMainElementWidth();
      this.initializeForm();
      this.viewManager.Initialize();
      this.initializeUploadManagerHandlers();
      this.SetEnabledInternal(this.clientEnabled, true);
    },
    InlineInitialize: function () {
      ASPxClientControl.prototype.InlineInitialize.call(this);
      this.initializeDomHelper();
      this.initializeOptions();
      this.initializeDragAndDrop();
      this.initializeFileValidator();
      this.initializeUploadManager();
      this.initializeViewManager();
    },
    initializeFileValidator: function () {
      this.fileValidator = new ASPxFileValidator(this.options);
    },
    initializeForm: function () {
      var form = this.GetParentForm();
      if (form) form.enctype = form.encoding = "multipart/form-data";
    },
    initializeDomHelper: function () {
      var domHelper = new ASPxDOMHelper({
        name: this.name,
        stateObject: this.stateObject,
      });
      domHelper.GetChildElement = this.GetChildElement.aspxBind(this);
      domHelper.GetMainElement = this.GetMainElement.aspxBind(this);
      domHelper.IsDisplayed = this.IsDisplayed.aspxBind(this);
      this.domHelper = domHelper;
    },
    initializeOptions: function () {
      var options = (this.options = {});
      options.advancedModeEnabled = this.advancedModeEnabled;
      options.autoModeEnabled = this.autoModeEnabled || false;
      options.autoStart = this.autoStart;
      options.maxFileCount = this.validationSettings.maxFileCount || 0;
      options.enableMultiSelect =
        (ASPxClientUploadControl.IsFileApiAvailable() ||
          this.IsSLPluginAvailable()) &&
        this.enableMultiSelect;
      options.domHelper = this.domHelper;
      options.templateDisabledRemoveItem = this.templateDisabledRemoveItem;
      options.fileInputCount = this.domHelper.GetFileInputCountInternal();
      options.showAddRemoveButtons = !!this.domHelper.GetChildElement(
        IdSuffixes.Input.ButtonCell.Add
      );
      options.multiFileInputEnabled =
        options.fileInputCount > 1 || options.showAddRemoveButtons;
      options.enableDragAndDrop =
        this.enableDragAndDrop &&
        ASPxClientUploadControl.IsDragAndDropAvailable() &&
        !ASPx.Browser.WebKitTouchUI &&
        !options.multiFileInputEnabled;
      options.externalDropZoneIDList = this.externalDropZoneIDList || [];
      options.inlineDropZoneAnchorElementID =
        this.inlineDropZoneAnchorElementID;
      options.disableInlineDropZone = this.disableInlineDropZone;
      options.dropZoneAnimationType = this.dropZoneAnimationType;
      this.enableDragAndDrop = options.enableDragAndDrop;
      options.enableFileList =
        options.enableMultiSelect &&
        this.enableFileList &&
        !options.multiFileInputEnabled;
      options.enableProgressPanel = !!this.GetProgressPanel();
      options.IsRightToLeft = this.IsRightToLeft.aspxBind(this);
      options.name = this.name;
      options.isFileApiAvailable = ASPxClientUploadControl.IsFileApiAvailable();
      options.isSLEnabled = this.IsSLPluginAvailable();
      options.isNative = this.isNative || false;
      options.selectedSeveralFilesText = this.selectedSeveralFilesText;
      options.nullText = this.getNullText();
      options.nullTextItem = this.nullTextItem;
      options.showProgressPanel = !!this.domHelper.GetChildElement(
        IdSuffixes.Progress.Panel
      );
      options.progressHandlerPage = this.progressHandlerPage;
      options.uploadingKey = this.uploadingKey;
      options.packetSize = this.packetSize || Constants.DEFAULT_PACKET_SIZE;
      options.uploadProcessingEnabled = this.uploadProcessingEnabled || false;
      options.slUploadHelperUrl = this.slUploadHelperUrl;
      options.unspecifiedErrorText = this.unspecifiedErrorText || "";
      options.uploadWasCanceledErrorText = this.uploadWasCanceledErrorText;
      options.generalErrorText = this.generalErrorText;
      options.dragAndDropMoreThanOneFileError =
        this.dragAndDropMoreThanOneFileError;
      options.customTooltip = this.domHelper.getTooltipValue() || "";
      options.settingsID = this.settingsID;
      options.signature = this.signature;
      options.validationSettings = this.validationSettings;
      options.fileInputSpacing = this.fileInputSpacing || "";
      options.dialogTriggerIDList = this.dialogTriggerIDList;
      options.accessibilityCompliant = this.accessibilityCompliant;
      options.templates = {
        DisabledTextBoxItem: this.templateDisabledTextBoxItem,
        DisabledClearBoxItem: this.templateDisabledClearBoxItem,
        HoveredBrowseItem: this.templateHoveredBrowseItem,
        PressedBrowseItem: this.templatePressedBrowseItem,
        DisabledRemoveItem: this.templateDisabledRemoveItem,
        DisabledBrowseItem: this.templateDisabledBrowseItem,
      };
    },
    initializeViewManager: function () {
      this.viewManager = new ASPxViewManager(this.options);
      this.viewManager.UploadCancelled.AddHandler(
        function () {
          this.uploadManager.CancelUploading(true);
        }.aspxBind(this)
      );
      this.viewManager.UploadStarted.AddHandler(
        function () {
          this.Upload();
        }.aspxBind(this)
      );
      this.viewManager.FileInputCountChangedInternal.AddHandler(
        this.raiseFileInputCountChanged.aspxBind(this)
      );
      this.viewManager.DropZoneEnter.AddHandler(
        this.raiseDropZoneEnter.aspxBind(this)
      );
      this.viewManager.DropZoneLeave.AddHandler(
        this.raiseDropZoneLeave.aspxBind(this)
      );
      this.fileValidator.ValidationErrorInternal.AddHandler(
        this.OnErrorInternal.aspxBind(this)
      );
      this.viewManager.InlineInitialize();
    },
    initializeUploadManager: function () {
      if (this.options.advancedModeEnabled) {
        if (this.options.isFileApiAvailable)
          this.options.uploadHelper = new ASPxUploadHelperHTML5(this.options);
        else this.options.uploadHelper = new ASPxUploadHelperSL(this.options);
        this.uploadManager = this.createUploadManager();
      } else {
        this.options.uploadHelper = new ASPxUploadHelperStandardStrategy(
          this.options
        );
        this.uploadManager = this.createUploadManager();
      }
      this.uploadManager.GetParentForm = this.GetParentForm.aspxBind(this);
    },
    initializeDragAndDrop: function () {
      if (this.options.enableDragAndDrop)
        aspxGetUploadControlCollection().initializeEvents();
    },
    createUploadManager: function () {
      return new ASPxLegacyUploadManager(this.options);
    },
    initializeUploadManagerHandlers: function () {
      this.uploadManager.FileUploadCompleteInternal.AddHandler(
        this.OnFileUploadComplete.aspxBind(this)
      );
      this.uploadManager.FilesUploadCompleteInternal.AddHandler(
        this.OnFilesUploadComplete.aspxBind(this)
      );
      this.uploadManager.FileUploadStartInternal.AddHandler(
        this.OnFileUploadStart.aspxBind(this)
      );
      this.uploadManager.UploadInitiatedInternal.AddHandler(
        this.viewManager.OnUploadInitiated.aspxBind(this.viewManager)
      );
      this.uploadManager.BeginProcessUploadingInternal.AddHandler(
        this.viewManager.OnBeginProcessUploading.aspxBind(this.viewManager)
      );
      this.uploadManager.UploadingProgressChangedInternal.AddHandler(
        this.OnUploadingProgressChangedInternal.aspxBind(this)
      );
      this.uploadManager.InCallbackChangedInternal.AddHandler(
        this.OnInCallbackChanged.aspxBind(this)
      );
      this.uploadManager.NeedSetJSProperties.AddHandler(
        this.setJSProperties.aspxBind(this)
      );
      this.uploadManager.InternalError.AddHandler(
        this.OnErrorInternal.aspxBind(this)
      );
      this.uploadManager.FileUploadErrorInternal.AddHandler(
        this.OnErrorInternal.aspxBind(this)
      );
    },
    getNullText: function () {
      var result = null;
      if (this.nullText) result = this.nullText;
      else if (this.enableDragAndDrop) result = this.dropZoneText;
      return result;
    },
    OnInCallbackChanged: function (isInCallback) {
      this.isInCallback = isInCallback;
      this.viewManager.InCallbackChanged(isInCallback);
    },
    OnFilesUploadComplete: function (args) {
      if (!args.uploadCancelled || this.options.autoStart)
        this.viewManager.Clear();
      this.viewManager.OnUploadFilesComplete(args);
      var fileUploadCompleteArgs =
        new ASPxClientUploadControlFilesUploadCompleteEventArgs(
          args.commonErrorText,
          args.commonCallbackData
        );
      this.FilesUploadComplete.FireEvent(this, fileUploadCompleteArgs);
    },
    OnFileUploadComplete: function (args) {
      this.FileUploadComplete.FireEvent(this, args);
    },
    OnFileUploadStart: function (args) {
      if (!this.FilesUploadStart.IsEmpty())
        this.FilesUploadStart.FireEvent(this, args);
      else if (!this.FileUploadStart.IsEmpty())
        this.FileUploadStart.FireEvent(this, args);
    },
    OnUploadingProgressChangedInternal: function (args) {
      this.RaiseUploadingProgressChanged(args);
      this.viewManager.UpdateProgress(args);
    },
    RaiseUploadingProgressChanged: function (args) {
      this.UploadingProgressChanged.FireEvent(this, args);
    },
    raiseDropZoneEnter: function (args) {
      this.DropZoneEnter.FireEvent(this, args);
    },
    raiseDropZoneLeave: function (args) {
      this.DropZoneLeave.FireEvent(this, args);
    },
    GetProgressPanel: function () {
      return this.domHelper.GetChildElement(IdSuffixes.Progress.Panel);
    },
    GetProgressControl: function () {
      return this.viewManager.GetProgressControl();
    },
    InitializeHandlers: function () {
      this.viewManager.StateChanged.AddHandler(
        function (args) {
          this.OnViewManagerStateChange(args);
        }.aspxBind(this)
      );
      this.fileInfosCache.FileListChanged.AddHandler(
        function (args) {
          this.OnFileListChanged(args);
        }.aspxBind(this)
      );
    },
    AdjustMainElementWidth: function () {
      var element = this.GetMainElement();
      if (this.IsDisplayed() && element.style.width == "") {
        if (ASPx.Browser.IE)
          element.style.width = ASPx.GetClearClientWidth(element);
        else element.style.width = ASPx.GetCurrentStyle(element).width;
      }
    },
    initializeForm: function () {
      var form = this.GetParentForm();
      if (form) form.enctype = form.encoding = "multipart/form-data";
    },
    OnViewManagerStateChange: function (args) {
      args.fileInfos = this.Validate(args.fileInfos);
      this.fileInfosCache.Update(args);
    },
    Validate: function (fileInfos) {
      return this.fileValidator.validate(fileInfos);
    },
    UpdateErrorMessageCell: function (index, errorText, isValid) {
      this.viewManager.UpdateErrorMessageCell(index, errorText, isValid);
    },
    OnFileListChanged: function (args) {
      args.isStateChanged = true;
      this.viewManager.RefreshViews(args);
      if (args.fileCountChanged || !this.options.enableMultiSelect)
        this.RaiseTextChanged(args.inputIndex);
      if (this.options.autoStart) this.Upload();
    },
    OnPluginLoaded: function (index) {
      this.viewManager.SetFileInputRowEnabled(true, index);
    },
    OnDocumentMouseUp: function () {
      this.viewManager.OnDocumentMouseUp();
    },
    InvokeTextChangedInternal: function (index) {
      this.viewManager.InvokeTextChangedInternal(index);
    },
    OnErrorInternal: function (args) {
      this.viewManager.HandleError(args);
    },
    setJSProperties: function (JSProperties) {
      for (var property in JSProperties)
        this[property] = JSProperties[property];
    },
    GetFileInputCountInternal: function () {
      return this.domHelper.GetFileInputCountInternal();
    },
    RaiseTextChanged: function (inputIndex) {
      if (!this.TextChanged.IsEmpty()) {
        var args = new ASPxClientUploadControlTextChangedEventArgs(inputIndex);
        this.TextChanged.FireEvent(this, args);
      }
    },
    raiseFileInputCountChanged: function () {
      if (!this.FileInputCountChanged.IsEmpty()) {
        var args = new ASPxClientEventArgs();
        this.FileInputCountChanged.FireEvent(this, args);
      }
    },
    IsRightToLeft: function () {
      return ASPx.IsElementRightToLeft(this.GetMainElement());
    },
    IsSLPluginInstalled: function () {
      if (!this.isSilverlightInstalled) {
        try {
          if (typeof ActiveXObject != "undefined") {
            var slControl = new ActiveXObject("AgControl.AgControl");
            if (slControl != null) this.isSilverlightInstalled = true;
          } else if (navigator.plugins["Silverlight Plug-In"])
            this.isSilverlightInstalled = true;
        } catch (e) {}
      }
      return this.isSilverlightInstalled;
    },
    IsSLPluginSupported: function () {
      return !(ASPx.Browser.Safari && ASPx.Browser.MajorVersion == 5);
    },
    IsSLPluginAvailable: function () {
      return this.IsSLPluginInstalled() && this.IsSLPluginSupported();
    },
    IsShowPlatformErrorElement: function () {
      return (
        this.advancedModeEnabled &&
        !ASPxClientUploadControl.IsFileApiAvailable() &&
        !this.IsSLPluginAvailable() &&
        !this.autoModeEnabled
      );
    },
    IsHelperElementReady: function (index) {
      return this.options.uploadHelper.IsHelperElementReady(index);
    },
    IsAdvancedModeEnabled: function () {
      return this.options.advancedModeEnabled;
    },
    UploadFileFromUser: function () {
      this.Upload();
    },
    UploadFile: function () {
      this.Upload();
    },
    AddFileInput: function () {
      this.viewManager.AddFileInput();
    },
    RemoveFileInput: function (index) {
      this.viewManager.RemoveFileInput(index);
    },
    RemoveFileFromSelection: function (fileIndex) {
      if (this.advancedModeEnabled && !this.isInCallback)
        this.fileInfosCache.RemoveFile(fileIndex);
    },
    GetText: function (index) {
      return this.viewManager.GetText(index);
    },
    SetCustomText: function (text, index) {
      this.viewManager.setText(text, index || 0);
    },
    SetCustomTooltip: function (tooltip, index) {
      this.viewManager.setTooltip(tooltip, index || 0);
    },
    GetFileInputCount: function () {
      return this.GetFileInputCountInternal();
    },
    SetFileInputCount: function (count) {
      this.viewManager.SetFileInputCount(count);
    },
    SetEnabled: function (enabled) {
      this.SetEnabledInternal(enabled);
    },
    GetEnabled: function () {
      return this.clientEnabled;
    },
    SetEnabledInternal: function (enabled, initialization) {
      if (this.clientEnabled !== enabled || initialization) {
        this.clientEnabled = enabled;
        this.viewManager.SetEnabled(enabled);
      }
    },
    Upload: function () {
      var fileInfos = this.fileInfosCache.Get(),
        filesCount = fileInfos.length;
      if (filesCount) {
        var uploadStarted = this.uploadManager.UploadFileFromUser(fileInfos);
        if (uploadStarted) this.viewManager.SetViewsEnabled(false);
      }
    },
    Cancel: function () {
      this.uploadManager.CancelUploading(true);
    },
    ClearText: function () {
      this.fileInfosCache.clear();
    },
    SetAddButtonText: function (text) {
      this.viewManager.SetAddButtonText(text);
    },
    SetUploadButtonText: function (text) {
      this.viewManager.SetUploadButtonText(text);
    },
    GetAddButtonText: function () {
      return this.viewManager.GetAddButtonText();
    },
    GetUploadButtonText: function () {
      return this.viewManager.GetUploadButtonText();
    },
    SetExternalDropZoneID: function (ids) {
      this.viewManager.SetExternalDropZoneID(ids);
    },
    SetDialogTriggerID: function (ids) {
      this.viewManager.SetDialogTriggerID(ids);
    },
    OnDragEnter: function (args) {
      this.viewManager.OnDragEnter(args);
    },
    OnDragLeave: function (args) {
      this.viewManager.OnDragLeave(args);
    },
    OnDrop: function (args) {
      this.viewManager.OnDrop(args);
    },
    AdjustControlCore: function () {
      ASPxClientControl.prototype.AdjustControlCore.call(this);
      this.viewManager.AdjustSize();
    },
    ShowTooManyFilesError: function () {
      window.alert(this.tooManyFilesErrorText);
    },
    IsInputsVisible: function () {
      return this.viewManager.isInputsVisible();
    },
    SuppressFileDialog: function (suppress) {
      this.viewManager.suppressFileDialog(suppress);
    },
  });
  ASPxClientUploadControl.Cast = ASPxClientControl.Cast;
  var ASPxFileValidator = ASPx.CreateClass(null, {
    constructor: function (options) {
      this.validationSettings = options.validationSettings;
      this.options = options;
      this.validators = this.CreateFileValidators();
      this.ValidationErrorInternal = new ASPxClientEvent();
    },
    clearValidationResult: function () {
      this.result = {
        validFileInfos: [],
        invalidFileNames: [],
        isValid: true,
        exceedCount: 0,
        initialFilesCount: 0,
        errorText: "",
      };
    },
    getFileExtension: function (fileName) {
      return fileName.replace(/.*?(\.[^.\\\/:*?\"<>|]+$)/, "$1");
    },
    CreateFileValidators: function () {
      var that = this;
      var validators = {
        fileName: {
          value: true,
          errorText: that.validationSettings.invalidWindowsFileNameErrorText,
          isValid: function (fileInfo) {
            var fileName = ASPx.Str.Trim(fileInfo.fileName),
              forbiddenCharsRegExp = /^[^\\/:\*\?"<>\|]+$/,
              forbiddenNamesRegExp = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i;
            return (
              forbiddenCharsRegExp.test(fileName) &&
              !forbiddenNamesRegExp.test(fileName)
            );
          },
          getErrorText: function () {
            return this.errorText;
          },
        },
        fileSize: {
          value: this.validationSettings.maxFileSize,
          errorText: this.validationSettings.maxFileSizeErrorText,
          isValid: function (fileInfo) {
            return fileInfo.fileSize < this.value;
          },
          getErrorText: function () {
            return this.errorText.replace("{0}", this.value);
          },
        },
        fileExtensions: {
          value: this.validationSettings.allowedFileExtensions,
          errorText: this.validationSettings.notAllowedFileExtensionErrorText,
          isValid: function (fileInfo) {
            var fileExtension = that
              .getFileExtension(fileInfo.fileName)
              .toLowerCase();
            return ASPx.Data.ArrayIndexOf(this.value, fileExtension) != -1;
          },
          getErrorText: function () {
            return this.errorText;
          },
        },
      };
      return this.options.advancedModeEnabled
        ? validators
        : { fileName: validators["fileName"] };
    },
    validateFileCore: function (fileInfo) {
      for (var validatorName in this.validators) {
        var validator = this.validators[validatorName];
        if (validator != null && validator.value) {
          if (!validator.isValid(fileInfo)) {
            this.result.commonErrorText = validator.getErrorText();
            return false;
          }
        }
      }
      return true;
    },
    validate: function (fileInfos) {
      this.clearValidationResult();
      this.validateFiles(fileInfos);
      if (!this.result.isValid) {
        this.raiseValidationError(this.result.errorText);
      }
      return this.result.validFileInfos;
    },
    validateFiles: function (fileInfos) {
      this.result.initialFilesCount =
        ASPxFileInfoCache.getPlainArray(fileInfos).length;
      this.result.validFileInfos = fileInfos;
      if (
        this.validationSettings.maxFileCount > 0 &&
        this.options.enableMultiSelect
      )
        this.validateFilesCount(fileInfos);
      this.validateFilesProperties();
    },
    validateFilesProperties: function () {
      var fileInfos = this.result.validFileInfos;
      for (var i = 0; i < fileInfos.length; i++) {
        var validFileInfos = [];
        ASPx.Data.ForEach(
          fileInfos[i].reverse(),
          function (fileInfo) {
            var isValid = this.validateFileCore(fileInfo);
            if (isValid) validFileInfos.push(fileInfo);
            else {
              this.result.invalidFileNames.push(fileInfo.fileName);
              fileInfo.dispose();
            }
          }.aspxBind(this)
        );
        fileInfos[i] = validFileInfos.slice();
        fileInfos[i].reverse();
      }
      var isValid = !this.result.invalidFileNames.length;
      if (!isValid) this.result.errorText = this.prepareResultErrorText();
      this.result.isValid = this.result.isValid && isValid;
      this.result.validFileInfos = fileInfos;
    },
    validateFilesCount: function () {
      var fileInfosArray = ASPxFileInfoCache.getPlainArray(
          this.result.validFileInfos
        ),
        invalidFilesCount,
        validFileInfos;
      invalidFilesCount =
        fileInfosArray.length - this.validationSettings.maxFileCount;
      validFileInfos = fileInfosArray.splice(
        0,
        this.validationSettings.maxFileCount
      );
      if (invalidFilesCount < 0) invalidFilesCount = 0;
      ASPx.Data.ForEach(fileInfosArray.reverse(), function (fileInfo) {
        if (fileInfo.fileName) fileInfo.dispose();
      });
      this.result.exceedCount = invalidFilesCount;
      this.result.validFileInfos = [validFileInfos];
      this.result.errorText = this.prepareMaxFileCountErrorText();
      this.result.isValid = invalidFilesCount === 0;
    },
    prepareMaxFileCountErrorText: function () {
      var errorText = "";
      if (this.result.exceedCount > 0) {
        errorText = this.validationSettings.maxFileCountErrorText
          .replace("{0}", this.result.exceedCount)
          .replace("{1}", this.validationSettings.maxFileCount);
      }
      return errorText;
    },
    prepareResultErrorText: function () {
      var errorText,
        multipleFilesSelected =
          this.result.initialFilesCount > 1 && this.options.enableMultiSelect;
      if (multipleFilesSelected) {
        errorText = this.validationSettings.multiSelectionErrorText
          .replace("{0}", this.result.invalidFileNames.length)
          .replace("{1}", this.validators.fileSize.value)
          .replace("{2}", this.result.invalidFileNames.join(", "));
      } else errorText = this.result.commonErrorText;
      if (this.result.errorText.length)
        errorText += "\n\n" + this.result.errorText;
      return errorText;
    },
    raiseValidationError: function (errorText) {
      var args = {
        text: errorText,
        type: ASPxUploadErrorTypes.Validation,
      };
      this.ValidationErrorInternal.FireEvent(args);
    },
  });
  var ASPxFileInfo = ASPx.CreateClass(null, {
    constructor: function (file, inputIndex, input) {
      this.file = file;
      this.fileName = file.name || file.fileName;
      this.fileSize = file.size || file.fileSize || 0;
      this.fileType = file.type || file.fileType || "";
      this.fullName = "C:\\fakepath\\" + this.fileName;
      this.inputIndex = inputIndex;
      this.OnDispose = new ASPxClientEvent();
      this.OnUploadStart = new ASPxClientEvent();
      this.OnUploadComplete = new ASPxClientEvent();
    },
    dispose: function () {
      this.OnDispose.FireEvent(this);
    },
  });
  var ASPxViewManager = ASPx.CreateClass(null, {
    constructor: function (options) {
      this.options = options;
      this.domHelper = options.domHelper;
      this.options.parentNode = this.GetUploadInputsTable();
      this.progressPanelView = null;
      this.InternalError = new ASPxClientEvent();
      this.StateChanged = new ASPxClientEvent();
      this.UploadCancelled = new ASPxClientEvent();
      this.UploadStarted = new ASPxClientEvent();
      this.FileInputCountChangedInternal = new ASPxClientEvent();
      this.DropZoneEnter = new ASPxClientEvent();
      this.DropZoneLeave = new ASPxClientEvent();
      this.DropZoneDropInternal = new ASPxClientEvent();
      this.InternalError.AddHandler(this.HandleError.aspxBind(this));
    },
    InlineInitialize: function () {
      this.initializeViewCollection(this.options);
      this.applyToViewCollection("InlineInitialize");
    },
    Initialize: function () {
      this.initializeViews();
      this.isInCallback = false;
      this.initializeHandlers();
    },
    initializeViewCollection: function (options) {
      this.viewCollection = [];
      var inputView = this.CreateFileInputView(options);
      if (inputView) this.viewCollection.push(inputView);
      if (options.enableFileList)
        this.viewCollection.push(new ASPxFileListView(options));
      if (options.enableDragAndDrop) {
        var dropZoneView = new ASPxDropZoneView(options);
        dropZoneView.DropZoneEnterInternal.AddHandler(
          this.raiseDropZoneEnter.aspxBind(this)
        );
        dropZoneView.DropZoneLeaveInternal.AddHandler(
          this.raiseDropZoneLeave.aspxBind(this)
        );
        dropZoneView.DropZoneDropInternal.AddHandler(
          this.raiseDropZoneDrop.aspxBind(this)
        );
        this.viewCollection.push(dropZoneView);
      }
      if (options.enableProgressPanel) {
        this.progressPanelView = new ASPxProgressPanelView(options);
        this.viewCollection.push(this.progressPanelView);
      }
      this.uploadButton = new ASPxButtonView(
        options,
        IdSuffixes.Input.ButtonCell.Upload,
        this.uploadButtonHandler.aspxBind(this)
      );
      this.cancelButton = new ASPxButtonView(
        options,
        IdSuffixes.Input.ButtonCell.Cancel,
        this.cancelButtonHandler.aspxBind(this)
      );
      this.errorView = new ASPxErrorView(options);
      ASPx.Data.ForEach(
        this.viewCollection,
        function (view) {
          view.ErrorOccurred.AddHandler(this.HandleError.aspxBind(this));
        }.aspxBind(this)
      );
    },
    initializeViews: function () {
      this.applyToViewCollection("Initialize");
    },
    uploadButtonHandler: function () {
      this.UploadStarted.FireEvent();
    },
    cancelButtonHandler: function () {
      this.UploadCancelled.FireEvent();
    },
    GetUploadInputsTable: function () {
      return this.domHelper.GetChildElement(IdSuffixes.Input.UploadInputsTable);
    },
    initializeHandlers: function () {
      for (var i = 0; i < this.viewCollection.length; i++) {
        var view = this.viewCollection[i];
        view.StateChangedInternal.AddHandler(
          function (view, args) {
            this.OnViewStateChanged(view, args);
          }.aspxBind(this)
        );
      }
    },
    CreateFileInputView: function (options) {
      var fileInputStrategy, fileInputView;
      if (options.isNative) fileInputView = ASPxNativeInputView;
      else if (options.advancedModeEnabled || options.autoModeEnabled) {
        if (options.isFileApiAvailable) fileInputView = ASPxHTML5InputView;
        else if (options.isSLEnabled) fileInputView = ASPxSLInputView;
      } else fileInputView = ASPxStandardInputView;
      if (!fileInputView) {
        if (options.autoModeEnabled) fileInputView = ASPxStandardInputView;
        else if (options.advancedModeEnabled)
          this.InternalError.FireEvent({ type: ASPxUploadErrorTypes.Platform });
      }
      if (fileInputView) {
        if (this.isInputsVisible()) {
          fileInputStrategy = new ASPxMultiFileInputView(
            options,
            fileInputView
          );
          fileInputStrategy.FileInputCountChangedInternal.AddHandler(
            this.raiseFileInputCountChanged.aspxBind(this)
          );
          this.addButton = new ASPxButtonView(
            options,
            IdSuffixes.Input.ButtonCell.Add,
            function () {
              fileInputStrategy.addFileInput();
            }.aspxBind(fileInputStrategy)
          );
          this.addButton.SetEnabled(true);
          this.domHelper.isMultiFileInput = true;
          if (fileInputStrategy)
            fileInputStrategy.FocusNeedResetInternal.AddHandler(
              this.resetFocus.aspxBind(this)
            );
        } else
          fileInputStrategy = new ASPxInvisibleFileInputDecorator(
            options,
            fileInputView
          );
      }
      return fileInputStrategy;
    },
    applyToViewCollection: function (method, args) {
      ASPx.Data.ForEach(this.viewCollection, function (view) {
        if (view[method]) view[method].apply(view, args || []);
      });
    },
    resetFocus: function (view, args) {
      var element = view.GetNextFocusElement(args);
      if (!args.backward) {
        if (!element) element = this.addButton && this.addButton.GetLink();
        if (!element)
          element = this.uploadButton && this.uploadButton.GetLink();
      }
      if (element) {
        element.focus();
        ASPx.Evt.PreventEvent(args.event);
      }
    },
    showFileInputError: function (error) {
      this.applyToViewCollection("showError", [error]);
    },
    showPlatformError: function () {
      ASPx.SetElementDisplay(this.GetUploadInputsTable(), false);
      ASPx.SetElementDisplay(this.getPlatformErrorPanel(), true);
    },
    getPlatformErrorPanel: function () {
      return this.domHelper.GetChildElement(
        IdSuffixes.Error.PlatformErrorTable
      );
    },
    showValidationError: function (error) {
      window.alert(error.text);
    },
    raiseFileInputCountChanged: function () {
      var args = new ASPxClientEventArgs();
      this.FileInputCountChangedInternal.FireEvent(this, args);
    },
    raiseDropZoneEnter: function (args) {
      this.DropZoneEnter.FireEvent(args);
    },
    raiseDropZoneLeave: function (args) {
      this.DropZoneLeave.FireEvent(args);
    },
    raiseDropZoneDrop: function (args) {
      this.DropZoneDropInternal.FireEvent(args);
    },
    OnViewStateChanged: function (view, args) {
      if (args.uploadCancelled) this.UploadCancelled.FireEvent();
      else this.StateChanged.FireEvent(args);
    },
    OnUploadInitiated: function () {
      this.errorView.Clear();
      this.applyToViewCollection("clearErrors");
      this.applyToViewCollection("OnUploadInitiated");
    },
    OnBeginProcessUploading: function () {
      this.applyToViewCollection("OnBeginProcessUploading");
      this.SetViewsEnabled(false);
    },
    OnUploadFilesComplete: function (args) {
      if (!this.lock) {
        this.lock = true;
        this.ShowCommonError(args);
        this.SetViewsEnabled(true);
        if (args.uploadCancelled) this.uploadButton.SetEnabled(true);
        this.applyToViewCollection("OnUploadFilesComplete", [args]);
        this.lock = false;
      }
    },
    OnDocumentMouseUp: function () {
      this.applyToViewCollection("OnDocumentMouseUp");
    },
    OnDragEnter: function (args) {
      this.applyToViewCollection("OnDragEnter", args);
    },
    OnDragLeave: function (args) {
      this.applyToViewCollection("OnDragLeave", args);
    },
    OnDrop: function (args) {
      this.applyToViewCollection("OnDrop", args);
    },
    HandleError: function (error) {
      switch (error.type) {
        case ASPxUploadErrorTypes.Common:
          this.errorView.UpdateCommonErrorDiv(error.text);
          break;
        case ASPxUploadErrorTypes.InputRowError:
          this.showFileInputError(error);
          break;
        case ASPxUploadErrorTypes.Platform:
          this.showPlatformError();
          break;
        case ASPxUploadErrorTypes.Validation:
          this.showValidationError(error);
          break;
      }
    },
    SetFileInputRowEnabled: function (enabled, index) {
      this.applyToViewCollection("SetFileInputRowEnabled", [enabled, index]);
    },
    RefreshViews: function (args) {
      if (!this.lock) {
        this.lock = true;
        this.errorView.Clear();
        args.skipRefreshInput =
          this.options.enableFileList && this.options.enableDragAndDrop;
        ASPx.Data.ForEach(this.viewCollection, function (view) {
          view.Refresh(args);
        });
        this.lock = false;
      }
      this.uploadButton.SetEnabled(!!args.fileInfosCount);
    },
    GetText: function (index) {
      var text = "";
      ASPx.Data.ForEach(this.viewCollection, function (view) {
        if (view.GetText) text = view.GetText(index || 0);
      });
      return text || "";
    },
    setText: function (text, index) {
      this.applyToViewCollection("setText", [text, index]);
    },
    setTooltip: function (text, index) {
      this.applyToViewCollection("setTooltip", [text, index]);
    },
    AddFileInput: function () {
      if (!this.options.enableDragAndDrop && !this.options.enableFileList)
        this.applyToViewCollection("addFileInput");
    },
    RemoveFileInput: function (index) {
      this.applyToViewCollection("removeFileInput", [index]);
    },
    SetFileInputCount: function (count) {
      this.applyToViewCollection("setFileInputCount", [count]);
    },
    GetFileInputElement: function (index) {
      var element;
      ASPx.Data.ForEach(this.viewCollection, function (view) {
        if (view.GetFileInputElement) element = view.GetFileInputElement(index);
      });
      return element;
    },
    Clear: function (args) {
      if (!this.lock) {
        this.lock = true;
        this.applyToViewCollection("Refresh", [ASPxEmptyRefreshArgs]);
        this.lock = false;
      }
    },
    ShowCommonError: function (args) {
      this.errorView.Refresh(args);
    },
    UpdateProgress: function (args) {
      this.applyToViewCollection("UpdateProgress", [args]);
    },
    InCallbackChanged: function (isInCallback) {
      this.applyToViewCollection("setInCallback", [isInCallback]);
    },
    SetViewsEnabled: function (enabled) {
      this.applyToViewCollection("SetEnabled", [enabled]);
      if (!enabled) this.uploadButton.SetEnabled(false);
      if (this.addButton) this.addButton.SetEnabled(enabled);
    },
    InvokeTextChangedInternal: function (index) {
      if (!this.lock)
        this.applyToViewCollection("InvokeTextChangedInternal", [index]);
    },
    getButtonLinkById: function (idPrefix) {
      var button = this.domHelper.GetChildElement(idPrefix),
        link = ASPx.GetNodeByTagName(button, "A", 0);
      return link || {};
    },
    SetAddButtonText: function (text) {
      this.getButtonLinkById(IdSuffixes.Input.ButtonCell.Add).innerHTML = text;
    },
    SetUploadButtonText: function (text) {
      this.getButtonLinkById(IdSuffixes.Input.ButtonCell.Upload).innerHTML =
        text;
    },
    GetAddButtonText: function () {
      return (
        this.getButtonLinkById(IdSuffixes.Input.ButtonCell.Add).innerHTML ||
        null
      );
    },
    GetUploadButtonText: function () {
      return (
        this.getButtonLinkById(IdSuffixes.Input.ButtonCell.Upload).innerHTML ||
        null
      );
    },
    SetEnabled: function (enabled) {
      this.SetViewsEnabled(enabled);
    },
    SetExternalDropZoneID: function (ids) {
      this.applyToViewCollection("SetExternalDropZoneID", [ids.split(";")]);
    },
    SetDialogTriggerID: function (ids) {
      this.applyToViewCollection("setDialogTriggerID", [ids]);
    },
    setInlineDropZoneAnchorElementID: function (id) {
      this.applyToViewCollection("SetInlineDropZoneAnchorElementID", [id]);
    },
    GetProgressControl: function () {
      if (this.options.enableProgressPanel)
        return this.progressPanelView.GetProgressControl();
      return null;
    },
    UpdateErrorMessageCell: function (index, errorText, isValid) {
      var args = {
        index: index,
        errorText: errorText,
        isValid: isValid,
      };
      this.errorView.UpdateErrorMessageCell(args);
    },
    AdjustSize: function () {
      this.adjustMainElementWidth();
      this.applyToViewCollection("AdjustSize");
    },
    adjustMainElementWidth: function () {
      var element = this.domHelper.GetMainElement();
      if (this.domHelper.IsDisplayed() && element.style.width == "") {
        if (ASPx.Browser.IE)
          element.style.width = ASPx.GetClearClientWidth(element);
        else element.style.width = ASPx.GetCurrentStyle(element).width;
      }
    },
    isInputsVisible: function () {
      return !ASPx.ElementHasCssClass(
        this.domHelper.GetMainElement(),
        CSSClasses.HiddenUI
      );
    },
    suppressFileDialog: function (suppress) {
      this.applyToViewCollection("suppressFileDialog", [suppress]);
    },
  });
  var ASPxBaseView = ASPx.CreateClass(null, {
    constructor: function (options) {
      options = options || [];
      this.baseName = options.name;
      this.IsRightToLeft = options.IsRightToLeft;
      this.options = options;
      this.domHelper = options.domHelper;
      this.id = options.id || 0;
      this.containerNode = options.containerNode;
      this.supressEvents = false;
      this.cache = {};
      this.buttonEventHandlers = {};
      this.StateChangedInternal = new ASPxClientEvent();
      this.ErrorOccurred = new ASPxClientEvent();
    },
    Initialize: function () {},
    InlineInitialize: function () {},
    GetContainerNode: function () {
      return (
        this.containerNode ||
        this.domHelper.GetChildElement(IdSuffixes.Input.UploadInputsTable)
      );
    },
    SetButtonEnabled: function (element, enabled) {
      this.ChangeButtonEnabledState(element, enabled);
      this.ChangeButtonEnabledAttributes(
        element,
        ASPx.Attr.ChangeAttributesMethod(enabled),
        enabled
      );
    },
    ChangeButtonEnabledState: function (element, enabled) {
      if (element)
        ASPx.GetStateController().SetElementEnabled(element, enabled);
    },
    ChangeButtonEnabledAttributes: function (element, method, enabled) {
      if (element) {
        var link = ASPx.GetNodeByTagName(element, "A", 0);
        if (link) {
          var isBrowseButton =
            element.className.indexOf(CSSClasses.BrowseButtonCell) != -1;
          if (!isBrowseButton)
            ASPx.Attr.SetOrRemoveAttribute(
              link,
              "tabindex",
              !enabled ? "-1" : "0"
            );
          ASPx.Attr.SetOrRemoveAttribute(
            link,
            "unselectable",
            !enabled ? "on" : null
          );
          if (ASPx.Browser.NetscapeFamily || ASPx.Browser.WebKitFamily) {
            method = this.ChangeEventsMethod(!enabled);
            method(
              link,
              "mousedown",
              function (e) {
                e.preventDefault();
                return false;
              },
              true
            );
          }
        }
      }
    },
    attachButtonHandler: function (element, enabled) {
      var method = this.ChangeEventsMethod(enabled);
      method(element, "click", this.buttonEventHandlers[element.id]);
    },
    GetElementFromCacheByClassName: function (className) {
      if (!this.cache[className])
        this.cache[className] = ASPx.GetNodesByPartialClassName(
          this.GetRenderResult(),
          className
        )[0];
      return this.cache[className];
    },
    GetID: function () {
      return this.id;
    },
    GetFullID: function () {
      return this.GetName() + this.GetInputRowPrefix() + this.GetID();
    },
    GetName: function () {
      return this.baseName;
    },
    GetUploadInputsTable: function () {
      return this.domHelper.GetChildElement(IdSuffixes.Input.UploadInputsTable);
    },
    GetInputRow: function (id) {
      return this.domHelper.GetChildElement(this.GetInputRowId(id));
    },
    GetInputRowPrefix: function () {
      return IdSuffixes.Input.FileInputRow;
    },
    GetInputRowId: function (id) {
      return this.GetInputRowPrefix() + (id || this.GetID());
    },
    GetRowTemplate: function () {
      return this.GetInputRow("T");
    },
    GetFileInfos: function () {
      return this.fileInfos;
    },
    getFileInfos: function () {
      return this.fileInfos;
    },
    GetFileNames: function (isShortName) {
      var fileInfos = this.getFileInfos(),
        files = [];
      for (var i in fileInfos) {
        if (fileInfos[i])
          files.push(
            isShortName ? fileInfos[i].fileName : fileInfos[i].fullName
          );
      }
      return files;
    },
    OnUploadFilesComplete: function () {},
    OnBeginProcessUploading: function () {},
    setInCallback: function (isInCallback) {
      this.isInCallback = isInCallback;
    },
    IsSlModeEnabled: function () {
      return (
        this.options.isSLEnabled &&
        !this.options.isFileApiAvailable &&
        (this.options.advancedModeEnabled || this.options.autoModeEnabled)
      );
    },
    RaiseStateChangedInternal: function (view) {
      var args = view.prepareInternalStateChangedArgs(view);
      if (!this.supressEvents && this.StateChangedInternal)
        this.StateChangedInternal.FireEvent(this, args);
    },
    raiseError: function (errorText) {
      var args = {
        type: ASPxUploadErrorTypes.Validation,
        text: errorText,
      };
      this.ErrorOccurred.FireEvent(args);
    },
    StopEventPropagation: function (evt) {
      if (ASPx.Browser.IE && ASPx.Browser.MajorVersion <= 8)
        evt.cancelBubble = true;
    },
    prepareInternalStateChangedArgs: function (view) {
      var fileInfos = view.GetFileInfos.call(view),
        inputIndex = view.GetID.call(view);
      return new ASPxViewStateChangedInternalArgs(fileInfos, inputIndex);
    },
    AttachEventForElement: function (element, eventName, func, detachOldEvent) {
      if (detachOldEvent && element["dx" + eventName])
        ASPx.Evt.DetachEventFromElement(
          element,
          eventName,
          element["dx" + eventName]
        );
      element["dx" + eventName] = func;
      ASPx.Evt.AttachEventToElement(
        element,
        eventName,
        element["dx" + eventName]
      );
    },
    DetachEventForElement: function (element, eventName) {
      if (element["dx" + eventName]) {
        ASPx.Evt.DetachEventFromElement(
          element,
          eventName,
          element["dx" + eventName]
        );
        element["dx" + eventName] = null;
      }
    },
    ChangeEventsMethod: function (attach) {
      return attach ? this.AttachEventForElement : this.DetachEventForElement;
    },
    UpdateIndex: function () {},
    Clear: function () {
      this.refreshBase(ASPxEmptyRefreshArgs);
      this.RaiseStateChangedInternal(this);
    },
    Dispose: function () {
      this.dropElementCache();
      ASPx.RemoveElement(this.GetRenderResult());
    },
    SetEnabled: function (enabled) {},
    EnsureRender: function () {
      if (!this.GetRenderResult()) {
        this.Render();
        this.AfterRender();
      }
    },
    Render: function () {},
    AfterRender: function () {},
    Refresh: function (args) {
      this.supressEvents = true;
      this.refreshBase(args);
      this.supressEvents = false;
    },
    refreshBase: function (args) {
      this.updateFileInfos(args);
    },
    updateFileInfos: function (args) {
      this.fileInfos = args.fileInfos;
    },
    GetRenderResult: function () {
      if (!this.renderResult)
        this.renderResult = this.domHelper.GetChildElement(
          this.GetInputRowId()
        );
      return this.renderResult;
    },
    getOwnerControl: function () {
      return aspxGetUploadControlCollection().Get(this.baseName);
    },
    dropElementCache: function (id) {
      ASPx.CacheHelper.DropCachedValue(
        this.getOwnerControl(),
        id || this.GetFullID()
      );
    },
  });
  var ASPxButtonView = ASPx.CreateClass(ASPxBaseView, {
    constructor: function (options, idSuffix, handler, disabledTemplate) {
      this.constructor.prototype.constructor.call(this, options);
      this.disabledItemTemplate = disabledTemplate;
      this.SetId(idSuffix);
      this.SetHandler(handler);
      this.CreateDisabledState();
      this.SetEnabled(false);
    },
    CreateDisabledState: function () {
      if (this.disabledItemTemplate) {
        ASPx.GetStateController().AddDisabledItem(
          this.GetName() + this.GetID(),
          this.disabledItemTemplate.className,
          this.disabledItemTemplate.cssText,
          this.disabledItemTemplate.postfixes,
          this.disabledItemTemplate.imageObjs,
          this.disabledItemTemplate.imagePostfixes
        );
      }
    },
    GetRenderResult: function () {
      return this.domHelper.GetChildElement(this.GetID());
    },
    GetLink: function () {
      return ASPx.GetNodeByTagName(this.GetRenderResult(), "A", 0);
    },
    SetId: function (id) {
      this.dropElementCache(this.GetName() + this.GetID());
      this.id = id;
    },
    SetHandler: function (handler) {
      this.handler = handler;
    },
    SetEnabled: function (enabled) {
      var method = this.ChangeEventsMethod(enabled),
        markup = this.GetRenderResult();
      if (markup) {
        method(this.GetRenderResult(), "click", this.handler, true);
        this.SetButtonEnabled(markup, enabled);
      }
    },
  });
  var ASPxCompositeView = ASPx.CreateClass(ASPxBaseView, {
    constructor: function (options) {
      this.constructor.prototype.constructor.call(this, options);
      this.initialized = false;
      this.views = [];
      this.removeButtons = [];
      this.options.containerNode = this.GetContainerNode();
      this.internalCount = this.internalCount || 0;
      this.internalIndex = this.internalIndex || 0;
      this.viewPrototype =
        options.viewPrototype || this.viewPrototype || undefined;
      this.templates = options.templates;
      this.createViews();
    },
    createViews: function () {
      for (var i = 0; i < this.internalCount; i++) this.addView();
    },
    Initialize: function () {
      ASPx.Data.ForEach(this.views, function (view) {
        view.Initialize();
        view.Refresh(ASPxEmptyRefreshArgs);
      });
      this.initialized = true;
    },
    InlineInitialize: function () {
      ASPx.Data.ForEach(this.views, function (view) {
        view.InlineInitialize();
      });
    },
    addView: function (fileInfo) {
      var index = this.internalIndex;
      this.options.id = index;
      var view = new this.viewPrototype(this.options),
        removeButton = new ASPxButtonView(
          this.options,
          this.getRemoveButtonPostfix(index),
          function () {
            this.onRemoveButtonClick(index);
          }.aspxBind(this),
          this.templates.DisabledRemoveItem
        );
      view.EnsureRender(fileInfo);
      if (this.initialized) {
        view.Initialize();
        view.Refresh(ASPxEmptyRefreshArgs);
      }
      removeButton.SetEnabled(true);
      this.views[index] = view;
      this.removeButtons[index] = removeButton;
      view.StateChangedInternal.AddHandler(this.onInternalStateChanged, this);
      this.internalIndex++;
    },
    removeView: function (index) {
      if (this.views[index]) {
        this.removeButtons[index].SetEnabled(false);
        this.views[index].Dispose();
        this.views[index] = undefined;
        for (
          var viewIndex = index + 1;
          viewIndex < this.internalCount;
          viewIndex++
        ) {
          var newIndex = viewIndex - 1;
          this.changeRemoveHandler(viewIndex, newIndex);
          this.views[viewIndex].UpdateIndex.call(
            this.views[viewIndex],
            newIndex
          );
          this.views[newIndex] = this.views[viewIndex];
          this.removeButtons[newIndex].SetEnabled(true);
        }
        this.internalCount--;
        this.internalIndex = this.internalCount;
        this.views.splice(this.internalCount, 1);
        this.RaiseStateChangedInternal(this);
      }
    },
    getRemoveButtonPostfix: function (index) {
      return IdSuffixes.Input.ButtonCell.Remove + index;
    },
    onRemoveButtonClick: function (index) {
      this.disposeFileInfo(index);
      this.removeView(index);
    },
    changeRemoveHandler: function (oldIndex, newIndex) {
      this.removeButtons[oldIndex].SetEnabled(false);
      this.removeButtons[newIndex] = this.removeButtons[oldIndex];
      this.removeButtons[newIndex].SetId(this.getRemoveButtonPostfix(newIndex));
      this.removeButtons[newIndex].SetHandler(
        function () {
          this.onRemoveButtonClick(newIndex);
        }.aspxBind(this)
      );
    },
    refreshView: function (view, commonArgs) {
      var args = this.getViewRefreshArgs(view, commonArgs);
      view.Refresh(args);
    },
    getViewRefreshArgs: function (view, commonArgs) {
      return {
        fileInfos: this.fileInfos[view.GetID()],
        isStateChanged: commonArgs.isStateChanged,
      };
    },
    GetView: function (index) {
      return this.views[index];
    },
    clearViews: function () {
      ASPx.Data.ForEach(this.views, this.clearView.aspxBind(this));
    },
    clearView: function (view, index) {
      view.Clear();
    },
    FilterViews: function () {},
    GetContainerNode: function () {
      var inputsTable = this.domHelper.GetChildElement(
        IdSuffixes.Input.UploadInputsTable
      );
      return ASPx.GetChildByTagName(inputsTable, "TBODY");
    },
    onInternalStateChanged: function () {
      this.RaiseStateChangedInternal();
    },
    RaiseStateChangedInternal: function () {
      this.FilterViews();
      ASPxBaseView.prototype.RaiseStateChangedInternal.call(this, this);
    },
    SetFileInputRowEnabled: function (enabled, index) {
      if (this.views[index]) {
        this.views[index].SetFileInputRowEnabled(enabled);
        this.removeButtons[index].SetEnabled(enabled);
      }
    },
    GetRemoveButtonCell: function (index) {
      var renderResult = this.views[index].GetRenderResult();
      return ASPx.GetNodesByPartialClassName(
        renderResult,
        CSSClasses.RemoveButtonCell
      )[0];
    },
    OnUploadFilesComplete: function (args) {
      ASPx.Data.ForEach(this.views, function (view) {
        view.OnUploadFilesComplete.call(view, args);
      });
    },
    SetEnabled: function (enabled) {
      ASPx.Data.ForEach(
        this.views,
        function (view, index) {
          view.SetEnabled(enabled);
          this.removeButtons[index].SetEnabled(enabled);
        }.aspxBind(this)
      );
    },
    ResetState: function () {
      ASPx.Data.ForEach(this.views, function (view) {
        view.ResetState();
      });
    },
    GetFileInfos: function () {
      var fileInfos = [];
      ASPx.Data.ForEach(this.views, function (view) {
        fileInfos.push(view.GetFileInfos());
      });
      return fileInfos;
    },
    refreshBase: function (args) {
      ASPxBaseView.prototype.refreshBase.call(this, args);
      ASPx.Data.ForEach(
        this.views,
        function (view) {
          this.refreshView(view, args);
        }.aspxBind(this)
      );
    },
    Clear: function () {
      this.supressEvents = true;
      this.clearViews();
      this.supressEvents = false;
    },
  });
  var ASPxFileListItem = ASPx.CreateClass(ASPxBaseView, {
    constructor: function (options) {
      this.constructor.prototype.constructor.call(this, options);
      this.templateDisabledRemoveItem = this.options.templateDisabledRemoveItem;
    },
    Render: function () {
      var template = this.GetRowTemplate().cloneNode(true);
      template.id = this.GetFullID();
      this.GetContainerNode().appendChild(template);
      this.progressControl = this.cloneProgressControl(template);
      ASPx.SetElementDisplay(template, true);
      this.correctNameSpanWidth();
      this.RedefineAttributes();
      this.SetState(CSSClasses.FileList.State.Pending);
    },
    cloneProgressControl: function (template) {
      var progressBarTemplateName =
          this.baseName + IdSuffixes.Input.FileList.ProgressControl,
        templateProgressControl = ASPx.GetControlCollection().Get(
          progressBarTemplateName
        ),
        clonedBarMarkup = ASPx.GetNodesByPartialClassName(
          template,
          CSSClasses.FileList.ProgressBar
        )[0],
        indicatorClassName =
          templateProgressControl.GetIndicatorDiv().className,
        clonedIndicatorDiv = ASPx.GetNodeByClassName(
          template,
          indicatorClassName
        ),
        progressControl;
      this.progressBarBaseId = templateProgressControl.name;
      clonedIndicatorDiv.id = this.progressBarBaseId + this.GetID() + "_DI";
      clonedBarMarkup.id = this.progressBarBaseId + this.GetID();
      progressControl = new ASPxClientProgressBarBase(
        this.progressBarBaseId + this.GetID()
      );
      progressControl.mainElement = clonedBarMarkup;
      progressControl.displayMode = templateProgressControl.displayMode;
      progressControl.customDisplayFormat =
        templateProgressControl.customDisplayFormat;
      progressControl.position = templateProgressControl.position;
      progressControl.minimum = templateProgressControl.minimum;
      progressControl.maximum = templateProgressControl.maximum;
      progressControl.onePercentValue = templateProgressControl.onePercentValue;
      progressControl.AfterCreate();
      return progressControl;
    },
    correctNameSpanWidth: function () {
      var progressBarShare = 0.283,
        fileNameShare = 1 - progressBarShare;
      var controlWidth = this.domHelper.GetMainElement().offsetWidth,
        fileRow = this.GetRenderResult(),
        fileNameCell = this.GetNameCell(fileRow),
        progressBarCell = this.getProgressBarCell(),
        stateDiv = ASPx.GetChildNodesByTagName(fileNameCell, "DIV");
      var fileNameWidth = fileNameShare * controlWidth - 1;
      var progressBarWidth = progressBarShare * controlWidth - 1;
      for (var i = 0; i < stateDiv.length; i++) {
        var fileNameLabel = ASPx.GetChildByTagName(stateDiv[i], "SPAN");
        fileNameLabel.style.maxWidth =
          fileNameWidth - ASPx.GetLeftRightPaddings(fileNameLabel) + "px";
        progressBarCell.style.width = progressBarWidth + "px";
      }
    },
    Dispose: function () {
      this.dropElementCache();
      this.GetRenderResult().parentNode.removeChild(this.GetRenderResult());
    },
    refreshBase: function (args) {
      ASPxBaseView.prototype.refreshBase.call(this, args);
      var fileRow = this.GetRenderResult(),
        fileNameCell = this.GetNameCell(fileRow),
        fileInfo = args.fileInfos;
      var stateDiv = ASPx.GetChildNodesByTagName(fileNameCell, "DIV");
      for (var i = 0; i < stateDiv.length; i++) {
        var fileNameLabel = ASPx.GetChildByTagName(stateDiv[i], "SPAN");
        fileNameLabel.innerHTML = fileInfo.fileName || "";
        fileNameLabel.title = fileInfo.fileName || "";
      }
      fileRow.aspxFileInfos = fileInfo;
    },
    GetFileInfos: function () {
      return ASPxBaseView.prototype.GetFileInfos.call(this);
    },
    RedefineAttributes: function (oldIndex) {
      this.dropElementCache();
      this.dropElementCache(this.GetRemoveButtonCell().id);
      this.GetRenderResult().id = this.GetFullID();
      this.GetRemoveButtonCell().id = this.GetRemoveRowButtonId();
      this.redefineProgressBarAttributes();
    },
    redefineProgressBarAttributes: function () {
      var progressbarMarkup = this.progressControl.GetMainElement(),
        progressBarIndicatorMarkup = this.progressControl.GetIndicatorDiv();
      this.dropElementCache(progressbarMarkup.id);
      this.dropElementCache(progressBarIndicatorMarkup.id);
      progressbarMarkup.id = this.progressBarBaseId + this.GetID();
      progressBarIndicatorMarkup.id =
        this.progressBarBaseId + this.GetID() + "_DI";
    },
    setId: function (newId) {
      this.id = newId;
    },
    SetState: function (newState) {
      var stateDiv = ASPx.GetChildNodesByTagName(this.GetNameCell(), "DIV")[0];
      if (!ASPx.ElementHasCssClass(stateDiv, newState)) {
        var stateClasses = CSSClasses.FileList.State;
        for (var state in stateClasses)
          ASPx.RemoveClassNameFromElement(stateDiv, stateClasses[state]);
        ASPx.AddClassNameToElement(stateDiv, newState);
      }
    },
    ResetState: function () {
      this.SetState(CSSClasses.FileList.State.Pending);
    },
    SetEnabled: function (enabled) {},
    GetRemoveRowButtonId: function () {
      return (
        this.GetName() +
        IdSuffixes.Input.FileList.RemoveRowButton +
        this.GetID()
      );
    },
    GetInputRowPrefix: function () {
      return IdSuffixes.Input.FileList.Row;
    },
    UpdateIndex: function (newIndex) {
      var oldIndex = this.GetID();
      this.setId(newIndex);
      this.RedefineAttributes(oldIndex);
    },
    GetNameCell: function () {
      return ASPx.GetChildByClassName(
        this.GetRenderResult(),
        CSSClasses.FileList.NameCell
      );
    },
    GetRemoveButtonCell: function () {
      return this.GetElementFromCacheByClassName(
        CSSClasses.FileList.RemoveButtonCell
      );
    },
    RaiseStateChangedInternal: function (args) {
      ASPxBaseView.prototype.RaiseStateChangedInternal.call(this, args);
    },
    OnFileItemUploadStart: function () {
      this.UpdateProgress({ currentFileProgress: 0 });
      this.SetState(CSSClasses.FileList.State.Uploading);
      this.progressControl.AdjustControl();
    },
    OnFileItemUploadComplete: function () {
      this.UpdateProgress({ currentFileProgress: 100 });
      this.SetState(CSSClasses.FileList.State.Complete);
    },
    OnUploadInitiated: function () {
      ASPx.SetElementDisplay(this.progressControl.GetMainElement(), true);
      ASPx.SetElementDisplay(this.getProgressBarCell(), true);
      ASPx.SetElementDisplay(this.GetRemoveButtonCell(), false);
      this.progressControl.AdjustControl(true);
    },
    OnUploadFilesComplete: function () {
      this.SetState(CSSClasses.FileList.State.Pending);
      ASPx.SetElementDisplay(this.getProgressBarCell(), false);
      this.UpdateProgress({ currentFileProgress: 0 });
    },
    UpdateProgress: function (args) {
      this.progressControl.SetPosition(parseInt(args.currentFileProgress));
    },
    getProgressBarCell: function () {
      return ASPx.GetNodesByPartialClassName(
        this.GetRenderResult(),
        CSSClasses.FileList.ProgressBarCell
      )[0];
    },
  });
  var ASPxFileListView = ASPx.CreateClass(ASPxCompositeView, {
    viewPrototype: ASPxFileListItem,
    constructor: function (options, id) {
      this.constructor.prototype.constructor.call(this, options);
      this.name = options.name + IdSuffixes.Input.FileList.List;
      this.progressControl = undefined;
      this.currentView = null;
      this.showList(false);
    },
    UpdateProgress: function (args) {
      if (this.currentView) this.currentView.UpdateProgress(args);
    },
    addView: function (fileInfo) {
      ASPxCompositeView.prototype.addView.call(this, fileInfo);
      var index = this.internalIndex - 1,
        view = this.views[index];
      fileInfo.OnUploadStart.ClearHandlers();
      fileInfo.OnUploadComplete.ClearHandlers();
      fileInfo.OnUploadStart.AddHandler(
        function () {
          view.OnFileItemUploadStart();
          this.currentView = view;
        }.aspxBind(this)
      );
      fileInfo.OnUploadComplete.AddHandler(
        function () {
          view.OnFileItemUploadComplete();
        }.aspxBind(this)
      );
    },
    removeView: function (index) {
      ASPxCompositeView.prototype.removeView.call(this, index);
      if (this.internalCount === 0) this.showList(false);
    },
    disposeFileInfo: function (index) {
      if (this.fileInfos[index]) this.fileInfos[index].dispose();
    },
    getRemoveButtonPostfix: function (index) {
      return IdSuffixes.Input.FileList.RemoveRowButton + index;
    },
    showList: function (show) {
      ASPx.SetElementDisplay(this.GetRenderResult(), show);
    },
    GetContainerNode: function () {
      return this.domHelper.GetChildElement(IdSuffixes.Input.FileList.List);
    },
    ResetState: function () {
      ASPxBaseInputView.prototype.ResetState.call(this);
      ASPx.Data.ForEach(this.views, function (view) {
        view.ResetState();
      });
    },
    OnUploadFilesComplete: function (args) {
      ASPx.Data.ForEach(
        this.views,
        function (view, index) {
          view.OnUploadFilesComplete();
          ASPx.SetElementDisplay(this.GetRemoveButtonCell(index), true);
        }.aspxBind(this)
      );
      this.currentView = null;
    },
    refreshBase: function (args) {
      this.fileInfos = args.fileInfos[0] || [];
      if (args.forceClear || this.fileInfos.length < this.internalCount)
        this.Clear();
      if (args.forceClear) return;
      if (this.fileInfos.length) this.showList(true);
      var currentCount = this.internalCount,
        endIndex = this.fileInfos.length;
      for (var i = currentCount; i < endIndex; i++) {
        this.addView(this.fileInfos[i]);
        this.internalCount++;
      }
      ASPxCompositeView.prototype.refreshBase.call(this, args);
    },
    SetEnabled: function (enabled) {
      ASPxCompositeView.prototype.SetEnabled.call(this, enabled);
    },
    clearViews: function () {
      for (var i = this.views.length; i >= 0; --i) this.clearView(null, i);
    },
    clearView: function (view, index) {
      this.removeView(index);
    },
    OnUploadInitiated: function () {
      ASPx.Data.ForEach(this.views, function (view) {
        view.OnUploadInitiated();
      });
    },
    GetRenderResult: function () {
      if (!this.renderResult)
        this.renderResult = ASPx.GetNodesByPartialClassName(
          this.domHelper.GetMainElement(),
          CSSClasses.FileList.List
        )[0];
      return this.renderResult;
    },
    GetFileInfos: function () {
      return [ASPxCompositeView.prototype.GetFileInfos.call(this)];
    },
    updateFileInfos: function (args) {
      this.fileInfos = args.fileInfos[0];
    },
  });
  var ASPxBaseInputView = ASPx.CreateClass(ASPxBaseView, {
    constructor: function (options) {
      this.constructor.prototype.constructor.call(this, options);
      this.nullText = options.nullText;
      this.templates = options.templates;
      this.enabled = true;
      this.triggerCursorsList = {};
      this.FocusNeedResetInternal = new ASPxClientEvent();
    },
    Initialize: function () {
      this.prepareFileInputRowTemplate();
      this.InitializeFakeFocusInputElement();
      this.InitializeTemplates();
      this.ChangeEventsToFileInput(true);
    },
    InitializeFakeFocusInputElement: function () {
      if (this.IsFocusNeedReset()) {
        var mainCell = this.GetUploadInputsTable().parentNode;
        var div = ASPx.CreateHtmlElementFromString(
          "<div class='dxucFFIHolder'></div>"
        );
        mainCell.appendChild(div);
        var fakeFocusInput = ASPx.CreateHtmlElementFromString(
          "<input readonly='readonly' class='dxucFFI'></input>"
        );
        fakeFocusInput.id = this.GetFakeFocusInputElementID();
        div.appendChild(fakeFocusInput);
      }
    },
    prepareFileInputRowTemplate: function () {
      this.fileInputRowTemplate = this.GetFileInputRowTemplate();
      this.fileInputRowTemplateNode = this.fileInputRowTemplate.cloneNode(true);
      ASPx.SetElementDisplay(this.fileInputRowTemplateNode, true);
    },
    Render: function () {
      var errorRowTemplate = this.GetErrorRowTemplate(),
        separatorRow = this.GetFileInputSeparatorRowTemplate().cloneNode(true),
        addButtonSeparator = this.domHelper.GetChildElement(
          IdSuffixes.Input.AddButtonsSeparator
        ),
        errorRow;
      if (errorRowTemplate) {
        errorRow = errorRowTemplate.cloneNode(true);
        this.errorRow = errorRow;
      }
      var inputRow = this.CreateInputRow();
      this.GetContainerNode().insertBefore(separatorRow, addButtonSeparator);
      this.GetContainerNode().insertBefore(inputRow, addButtonSeparator);
      if (errorRow) {
        this.GetContainerNode().insertBefore(errorRow, addButtonSeparator);
        ASPx.SetElementDisplay(errorRow, false);
      }
      ASPx.SetElementDisplay(separatorRow, true);
      ASPx.SetElementDisplay(inputRow, true);
      this.registerStates();
    },
    AfterRender: function () {
      this.ChangeEventsToFileInput(true);
    },
    Dispose: function () {
      ASPx.RemoveElement(this.GetErrorRow());
      ASPxBaseView.prototype.Dispose.call(this);
    },
    UpdateIndex: function (newIndex) {
      var oldIndex = this.GetID();
      this.dropElementCache();
      this.ChangeEventsToFileInput(false);
      this.setId(newIndex);
      this.RedefineAttributes(oldIndex);
      this.ChangeEventsToFileInput(true);
    },
    replaceFileInputElement: function () {
      var inputElement = this.getFileInputTemplate().cloneNode(),
        aspxFileInfos = this.GetFileInputElement().aspxFileInfos;
      this.GetFileInputElement().parentNode.replaceChild(
        inputElement,
        this.GetFileInputElement()
      );
      this.cache[CSSClasses.TextboxInput] = null;
      this.RedefineInputAttributes();
      this.ChangeEventsToFileInput(false);
      this.ChangeEventsToFileInput(true);
      this.GetFileInputElement().aspxFileInfos = aspxFileInfos;
    },
    setId: function (newId) {
      this.id = newId;
    },
    CreateInputRow: function () {
      var inputRow = this.GetRowTemplate().cloneNode(true);
      this.renderResult = inputRow;
      this.RedefineAttributes("T");
      return inputRow;
    },
    refreshBase: function (args) {
      ASPxBaseView.prototype.refreshBase.call(this, args);
      if (args.isStateChanged) this.clearErrors();
      if (this.fileInfos && !this.fileInfos.length) this.Clear();
    },
    updateFileInfos: function (args) {
      this.fileInfos = args.fileInfos[this.GetID()];
    },
    Clear: function () {
      this.clearFileInputValue();
      this.fileInfos = [];
      this.replaceFileInputElementIfNeeded();
      ASPxBaseView.prototype.Clear.call(this);
    },
    clearFileInputValue: function () {
      this.supressInputEvent = true;
      this.GetFileInputElement().value = "";
      this.supressInputEvent = false;
    },
    replaceFileInputElementIfNeeded: function () {
      if (this.GetFileInputElement().value) {
        this.replaceFileInputElement();
        this.Refresh(ASPxEmptyRefreshArgs);
      }
    },
    clearErrors: function () {
      var errorCell = this.GetErrorCell();
      if (errorCell) {
        errorCell.innerHTML = "";
        ASPx.SetElementDisplay(this.GetErrorRow(), false);
      }
    },
    showError: function (error) {
      var errorCell = this.GetErrorCell();
      if (errorCell) {
        var currentErrors = errorCell.innerHTML;
        errorCell.innerHTML = currentErrors + error.text + "<br />";
        ASPx.SetElementDisplay(this.GetErrorRow(), true);
      }
    },
    Validate: function () {},
    GetRemoveRowButtonId: function () {
      return this.GetName() + IdSuffixes.Input.ButtonCell.Remove + this.GetID();
    },
    RedefineAttributes: function (oldIndex) {
      this.RedefineInputRowAttributes(this.GetRenderResult());
      if (this.errorRow) this.RedefineErrorRowAttributes(oldIndex);
      this.RedefineRemoveAttributes();
    },
    RedefineRemoveAttributes: function () {
      var removeButtonCell = ASPx.GetNodesByPartialClassName(
        this.GetRenderResult(),
        CSSClasses.RemoveButtonCell
      )[0];
      if (removeButtonCell) removeButtonCell.id = this.GetRemoveButtonId();
    },
    GetRemoveButtonId: function () {
      return this.GetName() + IdSuffixes.Input.ButtonCell.Remove + this.GetID();
    },
    RedefineErrorRowAttributes: function (oldIndex) {
      this.GetErrorRow(oldIndex).id = this.GetName() + this.GetErrorRowId();
    },
    RedefineInputRowAttributes: function () {
      this.GetRenderResult().id = this.GetFullID();
      this.RedefineTextBoxAttributes();
    },
    RedefineTextBoxAttributes: function () {
      var textBoxCell = this.GetTextBoxCell();
      if (textBoxCell) {
        textBoxCell.id = this.GetTextBoxCellID();
        this.RedefineInputAttributes();
      }
    },
    RedefineInputAttributes: function () {
      var input = this.GetFileInputElement();
      var newInputID = this.GetFileInputElementId();
      input.id = newInputID;
      input.name = newInputID;
    },
    GetFileInputElementId: function () {
      return this.GetTextBoxCellID() + IdSuffixes.Input.FileInput;
    },
    ChangeTextBoxEnabledAttributes: function (element, method, enabled) {
      this.enabled = enabled;
      if (element) {
        var inputs = ASPx.GetNodesByTagName(element, "INPUT");
        for (var i = 0; i < inputs.length; i++) inputs[i].disabled = !enabled;
      }
    },
    ChangeClearBoxEnabledAttributes: function (element, method, enabled) {
      if (element) {
        var link = ASPx.GetNodeByTagName(element, "A", 0);
        this.ChangeButtonEnabledAttributes(link, method, enabled);
      }
    },
    SetFileInputRowEnabled: function (enabled) {
      this.SetTextBoxEnabled(this.GetTextBoxCell(), enabled);
    },
    SetTextBoxEnabled: function (element, enabled) {
      this.ChangeTextBoxEnabledState(element, enabled);
      this.ChangeTextBoxEnabledAttributes(
        element,
        ASPx.Attr.ChangeAttributesMethod(enabled),
        enabled
      );
    },
    ChangeTextBoxEnabledState: function (element, enabled) {
      if (element) {
        ASPx.GetStateController().SetElementEnabled(element, enabled);
        var editArea = ASPx.GetNodeByTagName(element, "INPUT", 1);
        if (editArea)
          ASPx.GetStateController().SetElementEnabled(editArea, enabled);
      }
    },
    SetClearBoxEnabled: function (element, enabled) {
      this.ChangeClearBoxEnabledState(element, enabled);
      this.ChangeClearBoxEnabledAttributes(
        element,
        ASPx.Attr.ChangeAttributesMethod(enabled),
        enabled
      );
    },
    ChangeClearBoxEnabledState: function (element, enabled) {
      if (element)
        ASPx.GetStateController().SetElementEnabled(element, enabled);
    },
    SetEnabled: function (enabled) {
      this.SetFileInputRowEnabled(enabled);
    },
    registerStates: function () {
      this.CreateTextBoxDisabledState();
      this.CreateClearBoxDisabledState();
      this.CreateBrowseHoveredState();
      this.CreateBrowsePressedState();
      this.CreateBrowseDisabledState();
    },
    CreateTextBoxDisabledState: function () {
      if (this.templates.DisabledTextBoxItem) {
        ASPx.GetStateController().AddDisabledItem(
          this.GetTextBoxCellID(),
          this.templates.DisabledTextBoxItem.className,
          this.templates.DisabledTextBoxItem.cssText,
          this.templates.DisabledTextBoxItem.postfixes,
          this.templates.DisabledTextBoxItem.imageUrls,
          this.templates.DisabledTextBoxItem.imagePostfixes
        );
      }
    },
    CreateClearBoxDisabledState: function () {
      if (this.templates.DisabledClearBoxItem) {
        ASPx.GetStateController().AddDisabledItem(
          this.GetClearBoxCellId(),
          this.templates.DisabledClearBoxItem.className,
          this.templates.DisabledClearBoxItem.cssText,
          this.templates.DisabledClearBoxItem.postfixes,
          this.templates.DisabledClearBoxItem.imageObjs,
          this.templates.DisabledClearBoxItem.imagePostfixes
        );
      }
    },
    CreateBrowseHoveredState: function () {
      if (this.templates.HoveredBrowseItem) {
        ASPx.GetStateController().AddHoverItem(
          this.GetBrowseButtonCellId(),
          this.templates.HoveredBrowseItem.className,
          this.templates.HoveredBrowseItem.cssText,
          this.templates.HoveredBrowseItem.postfixes,
          this.templates.HoveredBrowseItem.imageObjs,
          this.templates.HoveredBrowseItem.imagePostfixes
        );
      }
    },
    CreateBrowsePressedState: function () {
      if (this.templates.PressedBrowseItem) {
        ASPx.GetStateController().AddPressedItem(
          this.GetBrowseButtonCellId(),
          this.templates.PressedBrowseItem.className,
          this.templates.PressedBrowseItem.cssText,
          this.templates.PressedBrowseItem.postfixes,
          this.templates.PressedBrowseItem.imageObjs,
          this.templates.PressedBrowseItem.imagePostfixes
        );
      }
    },
    CreateBrowseDisabledState: function () {
      if (this.templates.DisabledBrowseItem) {
        ASPx.GetStateController().AddDisabledItem(
          this.GetBrowseButtonCellId(),
          this.templates.DisabledBrowseItem.className,
          this.templates.DisabledBrowseItem.cssText,
          this.templates.DisabledBrowseItem.postfixes,
          this.templates.DisabledBrowseItem.imageObjs,
          this.templates.DisabledBrowseItem.imagePostfixes
        );
      }
    },
    getBaseFileName: function (filePath) {
      if (!ASPxClientUploadControl.IsValidWindowsFileName(filePath))
        return filePath;
      var windowsFileNameRegExp = new RegExp(
        windowsFileNameRegExpTemplate,
        "gi"
      );
      return filePath.replace(windowsFileNameRegExp, "$2").replace("\\", "");
    },
    GetFileInfos: function () {
      var fileInfos = this.getFilesFromCache(),
        fileList = this.getFileList(),
        index = this.GetID(),
        fileCount;
      fileCount = fileList && fileList.length;
      if (fileCount && !this.options.enableMultiSelect) fileInfos = [];
      ASPx.Data.ForEach(
        fileList,
        function (fileInfo) {
          fileInfos.push(new ASPxFileInfo(fileInfo, index));
        }.aspxBind(this)
      );
      fileInfos = this.ensureFileInputIndex(fileInfos);
      this.subsribeFileInfos(fileInfos);
      return fileInfos;
    },
    getFilesFromCache: function () {
      return (
        (this.fileInfos && this.fileInfos.length && this.fileInfos.slice()) ||
        []
      );
    },
    getFileList: function () {
      var fileInputElement = this.GetFileInputElement(),
        fileList = [];
      if (fileInputElement.value) {
        var fileName = this.getBaseFileName(fileInputElement.value);
        fileList.push({ name: fileName });
      }
      return fileList;
    },
    ensureFileInputIndex: function (fileInfos) {
      if (fileInfos) {
        ASPx.Data.ForEach(
          fileInfos,
          function (fileInfo) {
            fileInfo.inputIndex = this.GetID();
          }.aspxBind(this)
        );
      }
      return fileInfos;
    },
    subsribeFileInfos: function (fileInfos) {
      ASPx.Data.ForEach(
        fileInfos,
        function (fileInfo) {
          fileInfo.OnDispose.ClearHandlers();
          fileInfo.OnDispose.AddHandler(
            function () {
              this.Refresh(ASPxEmptyRefreshArgs);
            }.aspxBind(this)
          );
        }.aspxBind(this)
      );
    },
    GetText: function (index) {
      return this.GetValue(index);
    },
    setText: function () {},
    setTooltip: function () {},
    GetValue: function (isShortName) {
      var value = this.GetFileNames(isShortName).join(", ");
      return value != "" ? value : null;
    },
    IsInputEmpty: function (index) {
      var value = this.GetFileNames(index || 0);
      return !value.length;
    },
    GetFileSelectorElement: function () {
      return this.GetFileInputElement();
    },
    GetErrorRow: function (id) {
      if (!this.errorRow)
        this.errorRow = this.domHelper.GetChildElement(this.GetErrorRowId(id));
      return this.errorRow;
    },
    GetErrorCell: function (row) {
      var row = this.GetErrorRow(),
        errorCell = null;
      if (row) {
        errorCell = ASPx.GetNodesByTagName(row, "TD")[0];
      }
      return errorCell;
    },
    GetErrorRowPrefix: function () {
      return IdSuffixes.Error.Row;
    },
    GetErrorRowId: function (id) {
      return this.GetErrorRowPrefix() + (id || this.GetID());
    },
    GetFileInputElement: function () {
      return this.GetElementFromCacheByClassName(CSSClasses.TextboxInput);
    },
    getFileInputTemplate: function () {
      return ASPx.GetNodesByPartialClassName(
        this.GetFileInputRowTemplate(),
        CSSClasses.TextboxInput
      )[0];
    },
    GetErrorRowTemplate: function () {
      return this.GetErrorRow("RT");
    },
    GetTextBoxCell: function () {
      return this.GetElementFromCacheByClassName(CSSClasses.Textbox);
    },
    GetTextBoxCellID: function (id) {
      var id = ASPx.IsExists(id) ? id : this.GetID();
      return this.GetName() + IdSuffixes.Input.TextBoxCell + id;
    },
    GetFileFakeInputElement: function () {
      return this.GetElementFromCacheByClassName(CSSClasses.TextboxFakeInput);
    },
    GetFileInputRowTemplate: function () {
      if (!this.fileInputRowTemplate) {
        var inputTemplate = this.GetInputRow("T");
        this.fileInputRowTemplate = ASPx.GetParentByTagName(
          inputTemplate,
          "TR"
        );
      }
      return this.fileInputRowTemplate;
    },
    GetFileInputSeparatorRowTemplate: function () {
      if (this.options.fileInputSpacing === "") return null;
      return ASPx.GetNodesByPartialClassName(
        this.GetUploadInputsTable(),
        CSSClasses.SeparatorRow
      )[0];
    },
    GetBrowseButtonCell: function () {
      return this.GetElementFromCacheByClassName(CSSClasses.BrowseButtonCell);
    },
    GetFakeFocusInputElementID: function () {
      return this.GetName() + IdSuffixes.Input.FakeFocusInput;
    },
    GetFakeFocusInputElement: function () {
      return ASPx.GetInputElementById(this.GetFakeFocusInputElementID());
    },
    setDialogTriggerID: function (ids) {
      this.triggerElements = this.triggerElements || [];
      if (this.triggerElements.length)
        aspxGetUploadControlCollection().SubscribeDialogTriggers(
          this,
          this.GetName(),
          this.triggerElements,
          this.getDialogTriggerHandlers(),
          false
        );
      this.ensureTriggerElementsCache(ids.split(";"));
      if (this.triggerElements.length)
        aspxGetUploadControlCollection().SubscribeDialogTriggers(
          this,
          this.GetName(),
          this.triggerElements,
          this.getDialogTriggerHandlers(),
          true
        );
      this.ensureTriggerCursors();
    },
    ensureTriggerCursors: function () {
      ASPx.Data.ForEach(
        this.triggerElements,
        function (trigger) {
          this.triggerCursorsList[trigger.id] = this.getElementCursor(trigger);
        }.aspxBind(this)
      );
    },
    ensureTriggerElementsCache: function (triggerIdList) {
      this.triggerElements = [];
      if (triggerIdList && triggerIdList.length && this.GetID() === 0) {
        ASPx.Data.ForEach(
          triggerIdList,
          function (triggerId) {
            var triggerElement = document.getElementById(triggerId);
            if (
              triggerElement &&
              ASPx.Data.ArrayIndexOf(this.triggerElements, triggerElement) ===
                -1
            )
              this.triggerElements.push(triggerElement);
          }.aspxBind(this)
        );
      }
    },
    getTriggerElements: function () {
      this.triggerElements = this.triggerElements || [];
      if (!this.triggerElements.length)
        this.ensureTriggerElementsCache(this.options.dialogTriggerIDList);
      return this.triggerElements;
    },
    InitializeTemplates: function () {
      if (this.options.fileInputSpacing != "") {
        this.fileInputSeparatorTemplateNode =
          this.GetFileInputSeparatorRowTemplate().cloneNode(true);
        ASPx.SetElementDisplay(this.fileInputSeparatorTemplateNode, true);
      }
    },
    IsFocusNeedReset: function () {
      return this.IsSlModeEnabled()
        ? !ASPx.Browser.IE
        : ASPx.Browser.IE || ASPx.Browser.Opera;
    },
    ChangeEventsToFileInput: function (attach) {
      var method = this.ChangeEventsMethod(attach),
        index = this.GetID(),
        fileInput = this.GetRenderResult();
      this.AttachOnChangeHandler(fileInput, method, attach);
    },
    AttachOnChangeHandlerCore: function (fileInput, method, attach) {
      this.attachOnChangeHandlerForInput(method);
      aspxGetUploadControlCollection().SubscribeDialogTriggers(
        this,
        this.GetName(),
        this.getTriggerElements(),
        this.getDialogTriggerHandlers(),
        attach
      );
      this.ensureTriggerCursors();
    },
    attachOnChangeHandlerForInput: function (method) {
      method(
        this.GetFileInputElement(),
        "change",
        function (evt) {
          this.onFileInputChange(evt);
        }.aspxBind(this)
      );
    },
    onFileInputChange: function (evt) {
      if (!this.supressInputEvent) this.RaiseStateChangedInternal(this);
    },
    getDialogTriggerHandlers: function () {
      var triggerHandlers = {};
      triggerHandlers.click = [this.createTriggerHandler(this.onTriggerClick)];
      if (!this.isSupportsInputClick()) {
        triggerHandlers.mousemove = [
          this.createTriggerHandler(this.onTriggerMouseMove),
          this.createTriggerHandler(
            this.onFileSelectorMouseMove,
            this.GetFileSelectorElement()
          ),
        ];
        triggerHandlers.mouseout = [
          this.createTriggerHandler(this.OnFileInputMouseOut),
          this.createTriggerHandler(
            this.onFileSelectorMouseOut,
            this.GetFileSelectorElement()
          ),
        ];
        triggerHandlers.mousedown = [
          this.createTriggerHandler(
            this.onFileSelectorMouseDown,
            this.GetFileSelectorElement()
          ),
        ];
      }
      return triggerHandlers;
    },
    createTriggerHandler: function (handler, target) {
      return {
        handler: handler,
        target: target,
      };
    },
    setFileInputPosition: function (e) {
      this.setFileInputPositionCore(e);
    },
    setFileInputPositionCore: function (e) {
      var space = 10,
        xPos = ASPx.Evt.GetEventX(e),
        yPos = ASPx.Evt.GetEventY(e),
        fileSelector = this.GetFileSelectorElement(),
        width = fileSelector.offsetWidth,
        height = fileSelector.offsetHeight;
      xPos -= this.IsRightToLeft() ? space : width - space;
      yPos -= height / 2;
      ASPx.SetAbsoluteY(fileSelector, yPos);
      ASPx.SetAbsoluteX(fileSelector, xPos);
    },
    onFileSelectorMouseMove: function (e, trigger) {
      if (this.domHelper.IsMouseOverElement(e, trigger)) {
        ASPx.Evt.CancelBubble(e);
        this.reraiseEvent(e, "onmousemove", trigger);
        ASPx.RemoveClassNameFromElement(
          this.GetFileSelectorElement(),
          this.GetFileInputOnTextBoxHoverClassName()
        );
        this.ensureCursorStyle(this.triggerCursorsList[trigger.id]);
      }
    },
    onFileSelectorMouseDown: function (e, trigger) {
      if (this.domHelper.IsMouseOverElement(e, trigger)) {
        ASPx.Evt.CancelBubble(e);
        this.reraiseEvent(e, "onmousedown", trigger);
      }
    },
    onFileSelectorMouseOut: function (e) {
      this.ensureCursorStyle("");
    },
    getElementCursor: function (element) {
      return ASPx.GetCurrentStyle(element).cursor;
    },
    ensureCursorStyle: function (cursor) {
      if (this.getElementCursor(this.GetFileSelectorElement()) !== cursor) {
        ASPx.SetStyles(this.GetFileSelectorElement(), {
          cursor: cursor,
        });
      }
    },
    onTriggerMouseMove: function (e) {
      if (this.enabled) this.setFileInputPosition(e, false, true);
    },
    isSupportsInputClick: function () {
      if (ASPx.Browser.IE)
        return ASPx.Browser.Version == 11 && !ASPx.Browser.TouchUI;
      return true;
    },
    onTriggerClick: function (e) {
      this.GetFileSelectorElement().click();
    },
    showFileChooserDialog: function () {
      var fileInput = this.GetFileSelectorElement();
      if (fileInput.click) fileInput.click();
    },
    OnUploadFilesComplete: function (args) {
      if (!args.uploadCancelled || this.options.autoStart) this.Clear();
    },
    OnDocumentMouseUp: function () {
      this.browseButtonPressed = false;
    },
    reraiseEvent: function (e, eventType, newTarget) {
      var evt;
      if (document.createEvent) {
        evt = document.createEvent("MouseEvents");
        evt.initMouseEvent(
          e.type,
          e.bubbles,
          e.cancelable,
          window,
          e.detail,
          e.screenX,
          e.screenY,
          e.clientX,
          e.clientY,
          e.ctrlKey,
          e.altKey,
          e.shiftKey,
          e.metaKey,
          e.button,
          e.relatedTarget
        );
        evt.target = newTarget;
        newTarget.dispatchEvent(evt);
      } else if (document.createEventObject) {
        evt = document.createEventObject(window.event);
        evt.type = e.type;
        evt.bubbles = e.bubbles;
        evt.cancelable = e.cancelable;
        evt.view = window;
        evt.detail = e.detail;
        evt.screenX = e.screenX;
        evt.screenY = e.screenY;
        evt.clientX = e.clientX;
        evt.clientY = e.clientY;
        evt.ctrlKey = e.ctrlKey;
        evt.altKey = e.altKey;
        evt.shiftKey = e.shiftKey;
        evt.metaKey = e.metaKey;
        evt.button = e.button;
        evt.relatedTarget = e.relatedTarget;
        newTarget.fireEvent(eventType, evt);
      }
    },
    suppressFileDialog: function (suppress) {
      this.ChangeEventsToFileInput(!suppress);
    },
  });
  var ASPxInvisibleFileInputDecorator = ASPx.CreateClass(ASPxBaseView, {
    constructor: function (options, view) {
      this.view = new view(options);
      this.options = options;
      this.initializeEvents();
      this.replaceFunctions();
    },
    initializeEvents: function () {
      this.StateChangedInternal = new ASPxClientEvent();
      this.ErrorOccurred = new ASPxClientEvent();
      this.view.StateChangedInternal.AddHandler(
        function (view, args) {
          this.StateChangedInternal.FireEvent(this.view, args);
        }.aspxBind(this)
      );
      this.view.ErrorOccurred.AddHandler(
        function (args) {
          this.ErrorOccurred.FireEvent(args);
        }.aspxBind(this)
      );
    },
    replaceFunctions: function () {
      this.view.getFileInputTemplate = this.getFileInputTemplate;
      this.view.GetFileInputElement = this.GetFileInputElement;
      this.view.baseGetFileInfos = this.view.GetFileInfos.aspxBind(this.view);
      this.view.GetFileInfos = this.GetFileInfos.aspxBind(this.view);
      this.view.SetFileInputTooltip = this.SetFileInputTooltip.aspxBind(
        this.view
      );
      this.view.SetFileInputRowEnabled =
        this.SetFileInputRowEnabled.aspxBind(this);
      this.view.GetRenderResult = this.GetRenderResult.aspxBind(this);
      this.view.GetUploadInputsTable = this.GetUploadInputsTable.aspxBind(this);
      this.view.prepareFileInputRowTemplate = this.noop;
      this.view.UpdateNullText = this.noop;
      this.view.InitializeFakeFocusInputElement = this.noop;
      this.view.InitializeTemplates = this.noop;
      this.view.InitializeFileInputStyles = this.noop;
      this.view.FileInputGotFocus = this.noop;
      this.view.FileInputLostFocus = this.noop;
      this.view.changeTooltip = this.noop;
      this.view.GetBrowseButtonCell = this.returnNull;
      this.view.GetTextBoxCell = this.returnNull;
    },
    SetFileInputRowEnabled: function () {
      this.view.enabled = true;
    },
    InvokeTextChangedInternal: function () {
      this.view.InvokeTextChangedInternal();
    },
    GetRenderResult: function () {
      return this.options.domHelper.GetMainElement();
    },
    Initialize: function () {
      this.view.Initialize.call(this.view);
    },
    InlineInitialize: function () {
      this.view.InlineInitialize.call(this.view);
    },
    Clear: function () {
      this.view.Clear.call(this.view);
    },
    GetText: function () {
      return this.view.GetText.call(this.view);
    },
    OnBeginProcessUploading: function () {
      this.view.OnBeginProcessUploading.call(this.view);
    },
    OnUploadFilesComplete: function (args) {
      this.view.OnUploadFilesComplete.call(this.view, args);
    },
    Refresh: function (args) {
      this.view.Refresh.call(this.view, args);
    },
    setDialogTriggerID: function (ids) {
      this.view.setDialogTriggerID.call(this.view, ids);
    },
    SetEnabled: function (enabled) {
      this.view.SetEnabled.call(this.view, enabled);
    },
    setInCallback: function (isInCallback) {
      this.view.setInCallback.call(this.view, isInCallback);
    },
    GetNextFocusElement: function () {
      return null;
    },
    noop: function () {},
    returnNull: function () {
      return null;
    },
    getFileInputTemplate: function () {
      return ASPx.GetNodesByPartialClassName(
        this.GetRenderResult(),
        CSSClasses.TextboxInput
      )[0];
    },
    GetFileInputElement: function () {
      return ASPx.GetNodesByPartialClassName(
        this.GetRenderResult(),
        CSSClasses.TextboxInput
      )[1];
    },
    GetFileInfos: function () {
      return [this.baseGetFileInfos()];
    },
    SetFileInputTooltip: function (text) {
      var handler =
        text != "" ? ASPx.Attr.SetAttribute : ASPx.Attr.RemoveAttribute;
      ASPx.Data.ForEach(this.getTriggerElements(), function (trigger) {
        handler(trigger, "title", text);
      });
      handler(this.GetFileSelectorElement(), "title", text);
    },
    GetUploadInputsTable: function () {
      return this.GetRenderResult();
    },
    suppressFileDialog: function (suppress) {
      this.view.suppressFileDialog.call(this.view, suppress);
    },
  });
  var ASPxStandardInputView = ASPx.CreateClass(ASPxBaseInputView, {
    constructor: function (options) {
      this.constructor.prototype.constructor.call(this, options);
      this.fileInputIsHidden = true;
      this.selectedSeveralFilesText = options.selectedSeveralFilesText;
      this.nullTextItem = options.nullTextItem;
      this.accessibilityCompliant = options.accessibilityCompliant;
    },
    InlineInitialize: function (options) {
      ASPxBaseView.prototype.InlineInitialize.call(this, options);
      this.UpdateNullText();
    },
    Initialize: function () {
      ASPxBaseInputView.prototype.Initialize.call(this, this.options);
      this.InitializeFileInputStyles();
    },
    InitializeFileInputStyles: function () {
      var styleSheet = ASPx.GetCurrentStyleSheet();
      ASPx.AddStyleSheetRule(
        styleSheet,
        " ." + this.GetFileInputOnTextBoxHoverClassName(),
        "cursor: " + ASPx.GetCurrentStyle(this.GetTextBoxCell())["cursor"] + ";"
      );
      ASPx.AddStyleSheetRule(
        styleSheet,
        " ." + this.GetFileInputOnBrowseButtonHoverClassName(),
        "cursor: " +
          ASPx.GetCurrentStyle(this.GetBrowseButtonCell())["cursor"] +
          ";"
      );
    },
    GetFileInputOnTextBoxHoverClassName: function () {
      return this.GetName() + CSSClasses.FITextBoxHoverDocument;
    },
    GetFileInputOnBrowseButtonHoverClassName: function () {
      return this.GetName() + CSSClasses.FIButtonHoverDocument;
    },
    GetClearBoxCell: function () {
      return this.GetElementFromCacheByClassName(CSSClasses.ClearButtonCell);
    },
    RedefineInputRowAttributes: function () {
      ASPxBaseInputView.prototype.RedefineInputRowAttributes.call(this);
      this.redefineClearBoxAttributes();
      this.GetBrowseButtonCell().id = this.GetBrowseButtonCellId();
    },
    redefineClearBoxAttributes: function () {
      var clearBox = this.GetClearBoxCell(),
        clearBoxImg = ASPx.GetNodeByTagName(clearBox, "IMG", 0),
        clearBoxId = this.GetClearBoxCellId(),
        clearBoxImgId = clearBoxId + IdSuffixes.Input.ButtonCell.ClearImg;
      if (clearBox) {
        clearBox.id = clearBoxId;
        if (clearBoxImg) clearBoxImg.id = clearBoxImgId;
      }
    },
    RedefineInputAttributes: function () {
      ASPxBaseInputView.prototype.RedefineInputAttributes.call(this);
      var fakeInputElement = this.GetFileFakeInputElement();
      if (fakeInputElement)
        fakeInputElement.id = this.GetFileFakeInputElementId();
    },
    GetClearBoxCellId: function () {
      return this.GetName() + IdSuffixes.Input.ButtonCell.Clear + this.GetID();
    },
    GetBrowseButtonCellId: function () {
      return this.GetName() + IdSuffixes.Input.ButtonCell.Browse + this.GetID();
    },
    SetFileInputRowEnabled: function (enabled) {
      ASPxBaseInputView.prototype.SetFileInputRowEnabled.call(this, enabled);
      this.SetClearBoxEnabled(this.GetClearBoxCell(), enabled);
      this.SetButtonEnabled(this.GetBrowseButtonCell(), enabled);
    },
    GetFileFakeInputElementId: function () {
      return this.GetTextBoxCellID() + IdSuffixes.Input.FileFakeInput;
    },
    SetFileInputTooltip: function (text) {
      var handler =
          text != "" ? ASPx.Attr.SetAttribute : ASPx.Attr.RemoveAttribute,
        isTextBoxHidden = this.isTextBoxHidden(),
        setTitleForSelector =
          (ASPx.Browser.Firefox && !this.IsSlModeEnabled()) ||
          (ASPx.Browser.WebKitFamily && isTextBoxHidden),
        element = isTextBoxHidden
          ? this.GetBrowseButtonCell()
          : this.GetTextBoxCell();
      handler(element, "title", text);
      if (setTitleForSelector && !this.accessibilityCompliant)
        handler(this.GetFileSelectorElement(), "title", text);
    },
    getFileInputTooltipText: function (files) {
      var value = "";
      if (typeof files == "object" && files instanceof Array) {
        var isNewlineSupported =
          ASPx.Browser.IE ||
          ASPx.Browser.WebKitFamily ||
          (ASPx.Browser.Firefox && !this.IsSlModeEnabled());
        if (isNewlineSupported && files.length > 1) {
          var i = 0;
          while (i < files.length) {
            if (i > 0) value += "\n";
            value += ASPx.Str.Trim(files[i++] || "");
          }
        } else value = files.join(", ");
      }
      return value;
    },
    ShowClearButton: function (show) {
      var clearBoxCell = this.GetClearBoxCell();
      if (clearBoxCell) {
        var link = ASPx.GetNodeByTagName(clearBoxCell, "A", 0);
        var func = show ? ASPx.Attr.RemoveAttribute : ASPx.Attr.SetAttribute;
        func(link.style, "visibility", "hidden");
      }
    },
    SetNullTextEnabled: function (enabled) {
      if (this.nullText != null) {
        if (enabled) this.SetFileFakeInputElementValue(this.nullText);
        this.ChangeTextBoxNullTextState(this.GetTextBoxCell(), enabled);
        this.ChangeClearBoxNullTextState(this.GetClearBoxCell(), enabled);
      }
    },
    ChangeTextBoxNullTextState: function (element, enabled) {
      if (element && (this.nullText || this.customText) && this.nullTextItem) {
        var restore = !enabled,
          styleAttrName = "style";
        ASPx.Attr.ChangeAttributesMethod(restore)(element, "class");
        ASPx.Attr.ChangeAttributesMethod(restore)(element, styleAttrName);
        var inputRow = null;
        if (this.nullTextItem.inputRow) {
          inputRow = this.GetInputRow();
          ASPx.Attr.ChangeAttributesMethod(restore)(inputRow, styleAttrName);
        }
        var editArea = this.GetFileFakeInputElement();
        if (editArea)
          ASPx.Attr.ChangeAttributesMethod(restore)(editArea, styleAttrName);
        if (enabled) {
          element.className = this.nullTextItem.textBox.className;
          element.style.cssText = this.nullTextItem.textBox.cssText;
          if (editArea)
            editArea.style.cssText = this.nullTextItem.editArea.cssText;
          if (this.nullTextItem.inputRow)
            inputRow.style.cssText = this.nullTextItem.inputRow.cssText;
        }
      }
    },
    ChangeClearBoxNullTextState: function (element, enabled) {
      if (element && this.nullText != null && this.nullTextItem) {
        var restore = !enabled;
        ASPx.Attr.ChangeAttributesMethod(restore)(element, "style");
        ASPx.Attr.ChangeAttributesMethod(restore)(element, "class");
        if (enabled) {
          element.className = this.nullTextItem.clearBox.className;
          element.style.cssText = this.nullTextItem.clearBox.cssText;
        }
      }
    },
    CreateSelectedSeveralFilesText: function (files) {
      var text = "",
        filteredFiles = [];
      if (files.length) {
        ASPx.Data.ForEach(files, function (file) {
          if (file !== undefined) {
            filteredFiles.push(file);
          }
        });
        files = filteredFiles;
        if (files.length > 1)
          text = this.selectedSeveralFilesText.replace("{0}", files.length);
        else if (files.length === 1) text = files[0];
      }
      return text;
    },
    SetFileFakeInputElementValue: function (value) {
      var element = this.GetFileFakeInputElement();
      if (element) element.value = value;
    },
    refreshBase: function (args) {
      ASPxBaseInputView.prototype.refreshBase.call(this, args);
      this.RefreshInput(args.skipRefreshInput);
    },
    RefreshInput: function (skipRefreshInput) {
      var files = this.GetFileNames(true),
        fakeInputValue = this.CreateSelectedSeveralFilesText(files),
        inputTooltip = skipRefreshInput
          ? fakeInputValue
          : this.getFileInputTooltipText(files);
      if (!inputTooltip && ASPx.Browser.Firefox && this.options.customTooltip)
        inputTooltip = this.options.customTooltip;
      this.SetFileInputTooltip(inputTooltip);
      if (!skipRefreshInput) {
        this.SetFileFakeInputElementValue(fakeInputValue);
        this.UpdateNullText();
        this.ShowClearButton(fakeInputValue && fakeInputValue !== "");
      }
    },
    UpdateNullText: function () {
      var isEmpty = this.IsInputEmpty();
      if (this.nullText != null) this.SetNullTextEnabled(isEmpty);
      else if (isEmpty) this.SetFileFakeInputElementValue("");
    },
    AttachOnChangeHandler: function (fileInput, method, attach) {
      var textBoxCell = this.GetTextBoxCell(),
        clearBoxCell = this.GetClearBoxCell(),
        browseButton = this.GetBrowseButtonCell(),
        fileSelectorElement = this.GetFileSelectorElement();
      if (textBoxCell) {
        method(
          textBoxCell,
          "mousemove",
          this.OnFileInputMouseMove.aspxBind(this)
        );
        method(
          textBoxCell,
          "mouseout",
          this.OnFileInputMouseOut.aspxBind(this)
        );
        method(textBoxCell, "click", this.OnBrowseButtonClick.aspxBind(this));
      }
      method(fileInput, "mouseout", this.OnBrowseButtonMouseOut.aspxBind(this));
      method(fileInput, "mousemove", this.OnFileInputMouseMove.aspxBind(this));
      method(fileInput, "mouseout", this.OnFileInputMouseOut.aspxBind(this));
      method(fileInput, "mousedown", this.OnFileInputMouseDown.aspxBind(this));
      method(
        fileSelectorElement,
        "focus",
        this.FileInputGotFocus.aspxBind(this)
      );
      method(
        fileSelectorElement,
        "blur",
        this.FileInputLostFocus.aspxBind(this)
      );
      if (this.IsFocusNeedReset())
        method(
          fileSelectorElement,
          "keydown",
          this.raiseFocusNeedResetInternal.aspxBind(this)
        );
      method(
        fileSelectorElement,
        "mousemove",
        this.OnFileInputMouseMove.aspxBind(this)
      );
      if (browseButton) {
        this.buttonEventHandlers[browseButton.id] =
          this.OnBrowseButtonClick.aspxBind(this);
        this.attachButtonHandler(browseButton, attach);
      }
      if (clearBoxCell) {
        this.buttonEventHandlers[clearBoxCell.id] = function () {
          if (this.isInCallback) return;
          this.Clear();
          this.clearErrors();
        }.aspxBind(this);
        this.attachButtonHandler(clearBoxCell, attach);
      }
      this.AttachOnChangeHandlerCore(fileInput, method, attach);
    },
    raiseFocusNeedResetInternal: function (e) {
      if (ASPx.Evt.GetKeyCode(e) === ASPx.Key.Tab) {
        var args = {
          backward: e.shiftKey,
          index: this.GetID(),
          event: e,
        };
        this.FocusNeedResetInternal.FireEvent(this, args);
      }
    },
    GetNextFocusElement: function (args) {
      var element = null;
      if (this.GetText() && !args.backward)
        element =
          this.GetClearBoxCell() && this.GetClearBoxCell().childNodes[0];
      return element;
    },
    IsMouseOverTextBox: function (evt) {
      return this.domHelper.IsMouseOverElement(evt, this.GetTextBoxCell());
    },
    IsMouseOverBrowseButton: function (evt) {
      return this.domHelper.IsMouseOverElement(evt, this.GetBrowseButtonCell());
    },
    isOverTriggerElement: function (evt) {
      var triggerElements = this.getTriggerElements();
      for (var i = 0; i < triggerElements.length; i++)
        if (this.domHelper.IsMouseOverElement(evt, triggerElements[i]))
          return true;
      return false;
    },
    isTextBoxHidden: function () {
      return this.GetFileFakeInputElement() == null;
    },
    FileInputGotFocus: function (evt) {
      var button = this.GetBrowseButtonCell();
      var focusedClassName = " " + CSSClasses.BrowseButtonFocus;
      button.className += focusedClassName;
      if (ASPx.Browser.Opera) {
        if (this._operaFocusedFlag) this._operaFocusedFlag = false;
        else {
          this._operaFocusedFlag = true;
          this.GetFakeFocusInputElement().focus();
          var _this = this;
          window.setTimeout(function () {
            _this.GetFileInputElement().focus();
          }, 100);
        }
      }
    },
    NeedMouseClickCorrection: function () {
      return !ASPx.Browser.TouchUI && this.fileInputIsHidden;
    },
    FileInputLostFocus: function (evt) {
      if (this.options.enableDragAndDrop)
        aspxGetUploadControlCollection().onFileInputLostFocus();
      var button = this.GetBrowseButtonCell();
      var focusedClassName = " " + CSSClasses.BrowseButtonFocus;
      var className = button.className;
      while (className.indexOf(focusedClassName) != -1)
        className = className.replace(focusedClassName, "");
      button.className = className;
    },
    OnBrowseButtonClick: function (evt) {
      this.OnClickInFakeElement(evt);
    },
    OnBrowseButtonMouseOut: function (e) {
      this.OnFileInputMouseOut(e);
      this.ChangeButtonHoveredState(this.GetBrowseButtonCell(), false);
    },
    OnFileInputMouseMove: function (evt) {
      this.OnMouseMoveInFileInputElement(evt);
    },
    OnFileInputMouseOut: function (e) {
      if (
        !(
          this.IsMouseOverBrowseButton(e) ||
          this.IsMouseOverTextBox(e) ||
          this.isOverTriggerElement(e)
        )
      ) {
        this.ResetFileInputPosition();
      }
      this.StopEventPropagation(e);
    },
    OnFileInputMouseDown: function (evt) {
      var isOverBrowseButton = this.IsMouseOverBrowseButton(evt);
      this.browseButtonPressed = true;
      this.ChangeButtonPressedState(
        this.GetBrowseButtonCell(),
        isOverBrowseButton
      );
    },
    OnMouseMoveInFakeElement: function (evt) {
      if (this.enabled) {
        var isOverBrowseButton = this.IsMouseOverBrowseButton(evt);
        this.setFileInputPosition(evt, isOverBrowseButton);
        var browseButtonCell = this.GetBrowseButtonCell();
        if (this.browseButtonPressed)
          this.ChangeButtonPressedState(browseButtonCell, isOverBrowseButton);
        else
          this.ChangeButtonHoveredState(browseButtonCell, isOverBrowseButton);
      }
    },
    OnMouseMoveInFileInputElement: function (evt) {
      if (this.enabled) {
        var isOverBrowseButton = this.IsMouseOverBrowseButton(evt),
          isOverTextBox = this.IsMouseOverTextBox(evt),
          isOverTriggerElement = this.isOverTriggerElement(evt),
          browseButtonCell = this.GetBrowseButtonCell();
        if (isOverTextBox || isOverBrowseButton || isOverTriggerElement) {
          this.setFileInputPosition(
            evt,
            isOverBrowseButton,
            isOverTriggerElement
          );
          if (this.browseButtonPressed)
            this.ChangeButtonPressedState(browseButtonCell, isOverBrowseButton);
          else if (!isOverTriggerElement)
            this.ChangeButtonHoveredState(browseButtonCell, isOverBrowseButton);
          this.changeTooltip(isOverTextBox);
        } else this.ResetFileInputPosition();
      }
    },
    OnClickInFakeElement: function (evt) {
      if (!this.NeedMouseClickCorrection()) return;
      this.OnMouseMoveInFakeElement(evt);
      this.showFileChooserDialog();
    },
    ChangeButtonHoveredState: function (element, enabled) {
      if (element && !this.browseButtonPressed) {
        element = enabled
          ? ASPx.GetStateController().GetHoverElement(element)
          : null;
        ASPx.GetStateController().SetCurrentHoverElement(element);
      }
    },
    ChangeButtonPressedState: function (element, enabled) {
      if (element) {
        var controller = ASPx.GetStateController();
        var pressedElement = controller.GetPressedElement(element);
        controller.SetPressedElement(enabled ? pressedElement : null);
      }
    },
    changeTooltip: function () {},
    setFileInputPosition: function (e, isChooseButton, isOverTrigger) {
      this.setFileInputPositionCore(e);
      this.SetFileInputCursor(isChooseButton, isOverTrigger);
      this.fileInputIsHidden = false;
    },
    SetFileInputCursor: function (isChooseButton, isOverTrigger) {
      var fileSelectorElement = this.GetFileSelectorElement(),
        initialClassName = fileSelectorElement.className,
        textboxHoverClass = this.GetFileInputOnTextBoxHoverClassName(),
        browseHoverClass = this.GetFileInputOnBrowseButtonHoverClassName(),
        hoverClassName = isChooseButton ? browseHoverClass : textboxHoverClass;
      if (isOverTrigger) hoverClassName = "";
      var newClassName = initialClassName
        .replace(textboxHoverClass, "")
        .replace(browseHoverClass, "")
        .replace(/^\s+|\s+$/g, "")
        .concat(" ", hoverClassName);
      if (initialClassName !== newClassName)
        fileSelectorElement.className = newClassName;
    },
    ResetFileInputPosition: function () {
      this.GetFileSelectorElement().style.top = "-5000px";
      this.fileInputIsHidden = true;
    },
    setText: function (text) {
      this.customText = text;
      this.SetFileFakeInputElementValue(text);
      this.ChangeTextBoxNullTextState(this.GetTextBoxCell(), false);
    },
    setTooltip: function (text) {
      this.SetFileInputTooltip(text);
    },
  });
  var ASPxMultiFileInputView = ASPx.CreateClass(ASPxCompositeView, {
    constructor: function (options, viewPrototype) {
      this.internalCount = options.fileInputCount;
      this.viewPrototype = viewPrototype;
      this.activeInputIndex = -1;
      this.constructor.prototype.constructor.call(this, options);
      this.FileInputCountChangedInternal = new ASPxClientEvent();
      this.FocusNeedResetInternal = new ASPxClientEvent();
    },
    GetRenderResult: function () {
      return this.GetUploadInputsTable();
    },
    raiseFileInputCountChanged: function () {
      var args = new ASPxClientEventArgs();
      this.FileInputCountChangedInternal.FireEvent(this, args);
    },
    Clear: function (index) {
      ASPx.Data.ForEach(this.views, function (view) {
        if (index === view.GetID() || index === undefined) view.Clear();
      });
    },
    AdjustSize: function () {
      ASPx.Data.ForEach(this.views, function (view) {
        if (view.AdjustSize) view.AdjustSize();
      });
    },
    getViewRefreshArgs: function (view, commonArgs) {
      var args = ASPxEmptyRefreshArgs,
        fileInfos = [],
        viewIndex = view.GetID(),
        isStateChanged =
          commonArgs.isStateChanged && commonArgs.inputIndex === viewIndex;
      fileInfos[viewIndex] = this.fileInfos[viewIndex] || [];
      if (fileInfos.length) {
        args = {
          fileInfos: fileInfos,
          isStateChanged: isStateChanged,
          skipRefreshInput: commonArgs.skipRefreshInput,
        };
      }
      return args;
    },
    addView: function (fileInfo) {
      ASPxCompositeView.prototype.addView.call(this, fileInfo);
      this.views[this.internalIndex - 1].FocusNeedResetInternal.AddHandler(
        this.raiseFocusNeedResetInternal,
        this
      );
    },
    onInternalStateChanged: function (_, args) {
      this.activeInputIndex = args.inputIndex;
      ASPxCompositeView.prototype.onInternalStateChanged.call(this);
    },
    prepareInternalStateChangedArgs: function (view) {
      var args =
        ASPxCompositeView.prototype.prepareInternalStateChangedArgs.call(
          this,
          view
        );
      args.inputIndex = this.activeInputIndex;
      this.activeInputIndex = -1;
      return args;
    },
    addFileInput: function (supressCountChanged) {
      if (
        this.options.maxFileCount &&
        this.internalCount >= this.options.maxFileCount
      )
        return;
      this.addView();
      this.internalCount++;
      this.updateInternalInputCountField(this.internalCount);
      if (this.internalCount === 1) this.showSeparatorRow(true);
      if (!supressCountChanged) this.raiseFileInputCountChanged();
    },
    raiseFocusNeedResetInternal: function (view, args) {
      this.FocusNeedResetInternal.FireEvent(this, args);
    },
    GetNextFocusElement: function (args) {
      var element = this.views[args.index].GetNextFocusElement(args),
        inputIndex = args.index + (args.backward ? -1 : 1),
        removeButtonIndex = args.backward ? inputIndex : args.index;
      if (this.IsSlModeEnabled()) {
        element =
          this.views[inputIndex] &&
          this.views[inputIndex].GetFileSelectorElement();
        if (!element && inputIndex > this.internalCount - 1)
          element = this.views[args.index].GetFakeFocusInputElement();
      }
      if (!element) {
        element =
          this.removeButtons[removeButtonIndex] &&
          this.removeButtons[removeButtonIndex].GetLink();
        if (!element)
          element =
            this.views[inputIndex] &&
            this.views[inputIndex].GetFileSelectorElement();
      }
      return element;
    },
    updateInternalInputCountField: function (count) {
      this.domHelper.stateObject.inputCount = count;
    },
    removeFileInput: function (index) {
      this.removeView(index);
    },
    removeView: function (index) {
      if (this.views[index]) {
        var separatorsCount = ASPx.GetNodesByPartialClassName(
          this.domHelper.GetMainElement(),
          CSSClasses.SeparatorRow
        ).length;
        if (separatorsCount > 1)
          ASPx.RemoveElement(
            ASPx.GetPreviousSibling(this.views[index].GetRenderResult())
          );
        ASPxCompositeView.prototype.removeView.call(this, index);
        this.updateInternalInputCountField(this.internalCount);
        this.raiseFileInputCountChanged();
      }
      if (this.internalCount === 0) this.showSeparatorRow(false);
    },
    disposeFileInfo: function (index) {
      if (
        this.fileInfos &&
        this.fileInfos[index] &&
        this.fileInfos[index].length
      ) {
        ASPx.Data.ForEach(this.fileInfos[index], function (fileInfo) {
          fileInfo.dispose();
        });
      }
    },
    showSeparatorRow: function (show) {
      var separatorRow = this.domHelper.GetAddUploadButtonsSeparatorRow();
      separatorRow && ASPx.SetElementDisplay(separatorRow, show);
    },
    setFileInputCount: function (count) {
      var currentCount = this.internalCount;
      if (count > currentCount) {
        for (var i = currentCount; i < count; i++) this.addFileInput(true);
      } else {
        for (var i = currentCount; i >= count; i--) this.removeFileInput(i);
      }
    },
    setDialogTriggerID: function (ids) {
      if (this.views && this.views[0]) this.views[0].setDialogTriggerID(ids);
    },
    setInCallback: function (isInCallback) {
      ASPxCompositeView.prototype.setInCallback.call(this, isInCallback);
      ASPx.Data.ForEach(this.views, function (view) {
        view.setInCallback(isInCallback);
      });
    },
    showError: function (error) {
      for (var i = 0; i < this.internalCount; i++) {
        if (i === error.inputIndex) this.views[i].showError(error);
      }
    },
    GetText: function (index) {
      return this.views[index].GetText();
    },
    setText: function (text, index) {
      if (this.views && this.views[index]) this.views[index].setText(text);
    },
    setTooltip: function (text, index) {
      if (this.views && this.views[index]) this.views[index].setTooltip(text);
    },
    GetFileInputElement: function (index) {
      var view = this.views[index || 0] || {};
      return view.GetFileInputElement.call(view);
    },
    GetFileInputRowTemplate: function (index) {
      var view = this.views[index || 0] || {};
      return view.GetFileInputRowTemplate.call(view);
    },
    GetErrorRow: function (index) {
      var view = this.views[index || 0] || {};
      return view.GetErrorRow.call(view, index);
    },
    GetErrorRowTemplate: function () {
      var view = this.views[0] || {};
      return view.GetErrorRowTemplate.call(view);
    },
    GetInputRow: function (index) {
      var view = this.views[index || 0] || {};
      return view.GetInputRow.call(view);
    },
    GetErrorCell: function (index) {
      var view = this.views[index || 0] || {};
      return view.GetErrorCell.call(view);
    },
    GetAddUploadButtonsSeparatorRow: function () {
      return this.GetChildElement(IdSuffixes.Input.AddButtonsSeparator);
    },
    GetAddUploadButtonsPanelRow: function () {
      return this.GetChildElement(IdSuffixes.Input.AddUploadButtonPanelRow);
    },
    InvokeTextChangedInternal: function (index) {
      if (this.views[index]) {
        this.views[index].InvokeTextChangedInternal();
      }
    },
    OnDocumentMouseUp: function () {
      ASPx.Data.ForEach(this.views, function (view) {
        view.OnDocumentMouseUp();
      });
    },
    suppressFileDialog: function (suppress) {
      ASPx.Data.ForEach(this.views, function (view) {
        view.suppressFileDialog(suppress);
      });
    },
  });
  var ASPxAdvancedInputView = ASPx.CreateClass(ASPxStandardInputView, {
    constructor: function (options) {
      this.constructor.prototype.constructor.call(this, options);
    },
    Initialize: function () {
      ASPxStandardInputView.prototype.Initialize.call(this, this.options);
      if (ASPx.Browser.IE) this.clearInputValue();
    },
    AttachOnChangeHandler: function (fileInput, method, attach) {
      ASPxStandardInputView.prototype.AttachOnChangeHandler.call(
        this,
        fileInput,
        method,
        attach
      );
      if (this.options.enableDragAndDrop) {
        var fileSelectorElement = this.GetFileSelectorElement();
        method(
          fileSelectorElement,
          "click",
          this.FileInputClick.aspxBind(this)
        );
      }
    },
    FileInputClick: function (evt) {
      aspxGetUploadControlCollection().onFileInputClick();
    },
    FileInputGotFocus: function (evt) {
      if (this.options.enableDragAndDrop)
        aspxGetUploadControlCollection().onFileInputGotFocus();
      ASPxStandardInputView.prototype.FileInputGotFocus.call(this, evt);
    },
    onFileInputChange: function (evt) {
      if (this.options.enableDragAndDrop)
        aspxGetUploadControlCollection().onFileInputChange();
      ASPxStandardInputView.prototype.onFileInputChange.call(this, evt);
    },
    RaiseStateChangedInternal: function (view) {
      ASPxStandardInputView.prototype.RaiseStateChangedInternal.call(
        this,
        view
      );
      this.clearInputValue();
    },
    refreshBase: function (args) {
      ASPxStandardInputView.prototype.refreshBase.call(this, args);
      this.clearInputValue();
    },
    clearInputValue: function () {
      this.supressInputEvent = true;
      if (ASPx.Browser.IE) this.replaceFileInputElement();
      else this.GetFileInputElement(0).value = "";
      this.supressInputEvent = false;
    },
    getFilesFromCache: function () {
      var files = [];
      if (
        this.options.enableMultiSelect ||
        !this.GetFileInputElement().files.length
      )
        files = ASPxStandardInputView.prototype.getFilesFromCache.call(this);
      return files;
    },
    getFileList: function () {
      return this.GetFileInputElement().files || [];
    },
    subsribeFileInfos: function () {},
  });
  var ASPxSLInputView = ASPx.CreateClass(ASPxAdvancedInputView, {
    constructor: function (options) {
      this.constructor.prototype.constructor.call(this, options);
      this.slUploadHelperUrl = options.slUploadHelperUrl;
      this.domHelper.GetSlUploadHelperElement =
        this.GetSlUploadHelperElement.aspxBind(this);
    },
    Initialize: function (options) {
      this.initSlObject();
      ASPxAdvancedInputView.prototype.Initialize.call(this, options);
      this.SetEnabled(false);
    },
    initSlObject: function () {
      if (
        !this.SlInitialized &&
        (!this.domHelper.IsSlObjectLoaded() || !this.GetRenderResult())
      ) {
        this.createSlHost();
        this.initInput();
        this.SlInitialized = true;
      }
    },
    Render: function () {
      ASPxAdvancedInputView.prototype.Render.call(this);
      this.initSlObject();
      this.SetEnabled(false);
    },
    Dispose: function () {
      ASPx.RemoveElement(this.GetFileSelectorElement());
      ASPxAdvancedInputView.prototype.Dispose.call(this);
    },
    UpdateIndex: function (newIndex) {
      this.cachedSlHelperElement = this.GetSlUploadHelperElement();
      ASPxAdvancedInputView.prototype.UpdateIndex.call(this, newIndex);
    },
    SetEnabled: function (enabled) {
      this.SetFileInputRowEnabled(enabled);
    },
    initInput: function () {
      var slHelper = this.CreateSlObject(this.slUploadHelperUrl);
      if (this.GetUploadHostElement())
        this.GetUploadHostElement().appendChild(slHelper);
      else
        this.GetFileInputElement().parentNode.insertBefore(
          slHelper,
          this.GetFileInputElement()
        );
      this.GetFileInputElement().parentNode.removeChild(
        this.GetFileInputElement()
      );
      ASPx.SetStyles(slHelper, {
        zIndex: Constants.INPUT_ZINDEX,
      });
    },
    createSlHost: function () {
      if (!this.GetUploadHostElement()) {
        var slHost = document.createElement("DIV");
        var mainCell = this.GetUploadInputsTable().parentNode;
        ASPx.Attr.SetAttribute(slHost, "id", this.GetHostElementId());
        ASPx.Attr.SetAttribute(slHost.style, "position", "absolute");
        ASPx.Attr.SetAttribute(slHost.style, "width", "0px");
        ASPx.Attr.SetAttribute(slHost.style, "height", "0px");
        ASPx.Attr.SetAttribute(slHost.style, "border-width", "0px");
        mainCell.appendChild(slHost);
      }
    },
    RedefineInputAttributes: function () {
      ASPxAdvancedInputView.prototype.RedefineInputAttributes.call(this);
      this.redefineSlObjectAttributes(this.cachedSlHelperElement);
    },
    redefineSlObjectAttributes: function (slElement) {
      if (this.GetUploadHostElement())
        this.RedefineSlObjectAttributesInHostElement(slElement);
      else this.RedefineSlObjectAttributes(slElement);
    },
    RedefineSlObjectAttributesInHostElement: function (slElement) {
      var slElement = slElement || this.GetSlUploadHelperElement();
      if (slElement) {
        slElement.id = this.GetSlUploadHelperElementID();
        if (this.domHelper.IsSlObjectLoaded(this.GetID()))
          slElement.content.sl.RedefineAttributes(this.baseName, this.GetID());
      }
    },
    clearInputValue: function () {},
    changeTooltip: function (isOverTextBox) {
      var tooltipElement = isOverTextBox
        ? this.GetTextBoxCell()
        : this.GetBrowseButtonCell();
      var tooltip = ASPx.Attr.GetAttribute(tooltipElement, "title");
      ASPx.Attr.SetAttribute(
        this.GetFileSelectorElement(),
        "title",
        tooltip ? tooltip : ""
      );
    },
    renewFileInfosSubscribtion: function (fileInfos) {
      if (this.domHelper.IsSlObjectLoaded(this.GetID())) {
        var slElement = this.GetSlUploadHelperElement(),
          fileInfosArray = fileInfos || this.fileInfos || [];
        ASPx.Data.ForEach(
          fileInfosArray,
          function (fileInfo, index) {
            fileInfo.OnDispose.ClearHandlers();
            fileInfo.OnDispose.AddHandler(function () {
              slElement.content.sl.DisposeFileInfo(index);
            });
          }.aspxBind(this)
        );
      }
    },
    GetNextFocusElement: function () {
      return null;
    },
    RedefineSlObjectAttributes: function (slElement) {
      var slElement =
          slElement ||
          ASPx.GetNodeByTagName(this.GetTextBoxCell(), "OBJECT", 0),
        inputIndex = this.GetID();
      if (slElement) {
        var slObjectId = this.GetSlUploadHelperElementID(inputIndex);
        var controlName = this.baseName;
        slElement.id = slObjectId;
        if (this.domHelper.IsSlObjectLoaded(inputIndex))
          slElement.content.sl.RedefineAttributes(controlName, inputIndex);
      }
    },
    GetUploadHostElement: function () {
      if (!this.slUploadHostElement)
        this.slUploadHostElement = document.getElementById(
          this.GetSlUploadHostElementID()
        );
      return this.slUploadHostElement;
    },
    GetSlUploadHostElementID: function () {
      return this.GetName() + IdSuffixes.SL.UploadHost;
    },
    InlineInitialize: function (options) {
      ASPxAdvancedInputView.prototype.InlineInitialize.call(this, options);
      if (!ASPx.Browser.Opera) this.SetFileInputRowEnabled(false);
    },
    CreateSlObject: function (source) {
      var inputIndex = this.GetID();
      var slObjectId = this.GetUploadHelperElementID(inputIndex);
      var controlName = this.GetName();
      var properties = { width: "70px", height: "22px" };
      var events = {};
      events.onLoad = "slOnLoad_" + slObjectId;
      window[events.onLoad] = function () {
        ASPx.SLOnLoad(this.GetName(), inputIndex);
      }.aspxBind(this);
      events.onError = "slOnError_" + slObjectId;
      window[events.onError] = function () {
        ASPx.SLOnError(this.GetName(), inputIndex);
      }.aspxBind(this);
      var parentElement = document.createElement("DIV");
      parentElement.innerHTML = this.BuildHTML(
        source,
        slObjectId,
        controlName,
        inputIndex,
        properties,
        events
      );
      return parentElement.firstChild;
    },
    BuildHTML: function (
      source,
      id,
      controlName,
      inputIndex,
      properties,
      events
    ) {
      var sb = [];
      sb.push(
        '<object type="application/x-silverlight-2" data="data:application/x-silverlight-2,"'
      );
      sb.push(' id="' + id + '"');
      if (properties.width != null)
        sb.push(' width="' + properties.width + '"');
      if (properties.height != null)
        sb.push(' height="' + properties.height + '"');
      var opacityStyle = "";
      if (!ASPx.Browser.IE) opacityStyle = "opacity: 0.01;";
      sb.push(
        ' style="position: absolute; background-color: transparent; top: -5000px; ' +
          opacityStyle +
          '"'
      );
      sb.push(">");
      sb.push('<param name="source" value="' + source + '" />');
      sb.push('<param name="background" value="Transparent" />');
      sb.push('<param name="windowless" value="true" />');
      sb.push('<param name="minRuntimeVersion" value="3.0.40818.0" />');
      var init = '<param name="initParams" value="';
      init += "controlName=" + controlName + ", ";
      init += "inputIndex=" + inputIndex + ", ";
      init += "multiselect=" + this.options.enableMultiSelect + ", ";
      init +=
        "allowedMaxFileSize=" + this.options.validationSettings.maxFileSize;
      var allowedFileExtensions =
        this.options.validationSettings.allowedFileExtensions;
      if (allowedFileExtensions != null) {
        init +=
          ", allowedFileExtensions=" + allowedFileExtensions.join(";") + ", ";
        var fileMasks = [];
        for (var i = 0; i < allowedFileExtensions.length; i++)
          fileMasks.push("*" + allowedFileExtensions[i]);
        init += "filter=" + fileMasks.join(";");
      }
      init += '" />';
      sb.push(init);
      if (events.onLoad)
        sb.push('<param name="onLoad" value="' + events.onLoad + '" />');
      if (events.onError)
        sb.push('<param name="onError" value="' + events.onError + '" />');
      sb.push("</object>");
      return sb.join("");
    },
    InvokeTextChangedInternal: function () {
      this.changed = true;
      this.RaiseStateChangedInternal(this);
      this.changed = false;
    },
    GetFileInfos: function () {
      var slElement,
        slFileInfos,
        fileInfo,
        inputIndex = this.GetID(),
        currentFilesLength = (this.fileInfos && this.fileInfos.length) || 0;
      if (this.domHelper.IsSlObjectLoaded(inputIndex)) {
        slElement = this.GetSlUploadHelperElement();
        if (
          !this.options.enableMultiSelect &&
          currentFilesLength &&
          this.changed
        ) {
          this.fileInfos[0].dispose();
          this.fileInfos.splice(0, 1);
        }
        var fileInfos = (this.fileInfos && this.fileInfos.slice()) || [];
        currentFilesLength = fileInfos.length;
        slFileInfos = eval(slElement.content.sl.FileInfos);
        ASPx.Data.ForEach(
          slFileInfos,
          function (file, index) {
            if (index >= currentFilesLength) {
              file.fileType = "";
              fileInfo = new ASPxFileInfo(file, this.GetID());
              fileInfos.push(fileInfo);
            }
          }.aspxBind(this)
        );
      }
      this.renewFileInfosSubscribtion(fileInfos);
      fileInfos = this.ensureFileInputIndex(fileInfos);
      return fileInfos || [];
    },
    GetUploadHelperElementID: function () {
      return this.GetTextBoxCellID() + IdSuffixes.SL.UploadHelper;
    },
    GetFileSelectorElement: function () {
      return this.GetSlUploadHelperElement();
    },
    GetSlUploadHelperElement: function (id) {
      return document.getElementById(this.GetSlUploadHelperElementID(id));
    },
    GetSlUploadHelperElementID: function (id) {
      return this.GetTextBoxCellID(id) + IdSuffixes.SL.UploadHelper;
    },
    SetFileInputCursor: function (isChooseButton, isOverTrigger) {
      ASPxStandardInputView.prototype.SetFileInputCursor.call(
        this,
        isChooseButton,
        isOverTrigger
      );
      var fileSelectorElement = this.GetFileSelectorElement();
      this.SetCursorStyle(ASPx.GetCurrentStyle(fileSelectorElement)["cursor"]);
    },
    GetHostElementId: function () {
      return this.baseName + IdSuffixes.SL.UploadHost;
    },
    SetCursorStyle: function (cursorStyle) {
      var inputIndex = this.GetID();
      if (this.domHelper.IsSlObjectLoaded(inputIndex)) {
        var slElement = this.domHelper.GetSlUploadHelperElement(inputIndex);
        slElement.content.sl.SetCursorStyle(cursorStyle);
      }
    },
    Clear: function () {
      this.options.uploadHelper.ClearFileInfos(this.GetID());
      ASPxAdvancedInputView.prototype.Clear.call(this);
    },
    clearFileInputValue: function () {},
    replaceFileInputElementIfNeeded: function () {},
    refreshBase: function (args) {
      ASPxAdvancedInputView.prototype.refreshBase.call(this, args);
      this.renewFileInfosSubscribtion();
    },
    attachOnChangeHandlerForInput: function () {},
    getDialogTriggerHandlers: function () {
      var triggerHandlers =
        ASPxAdvancedInputView.prototype.getDialogTriggerHandlers.call(this);
      triggerHandlers.mousemove = triggerHandlers.mousemove || [];
      triggerHandlers.mousemove.push(
        this.createTriggerHandler(this.OnFileInputMouseMove)
      );
      return triggerHandlers;
    },
  });
  var ASPxHTML5InputView = ASPx.CreateClass(ASPxAdvancedInputView, {
    constructor: function (options) {
      this.constructor.prototype.constructor.call(this, options);
    },
    Initialize: function () {
      ASPxAdvancedInputView.prototype.Initialize.call(this, this.options);
      if (this.options.enableMultiSelect) {
        this.GetFileSelectorElement().multiple = true;
        this.initializeTemplateInput();
      }
    },
    initializeTemplateInput: function () {
      this.getFileInputTemplate().multiple = true;
    },
  });
  var ASPxNativeInputView = ASPx.CreateClass(ASPxBaseInputView, {
    constructor: function (options) {
      this.constructor.prototype.constructor.call(this, options);
    },
    Initialize: function () {
      ASPxBaseInputView.prototype.Initialize.call(this);
      if (ASPx.Browser.Firefox) this.correctFileInputSize();
    },
    EnsureRender: function () {
      ASPxBaseInputView.prototype.EnsureRender.call(this);
      if (ASPx.Browser.Firefox) this.correctFileInputSize();
    },
    AdjustSize: function () {
      this.correctFileInputSize();
    },
    correctFileInputSize: function () {
      if (!this.domHelper.GetMainElement()) return;
      var width = this.GetFileInputElement().clientWidth,
        fontSize = ASPx.GetCurrentStyle(this.GetFileInputElement()).fontSize,
        size = this.findInputSize(width, fontSize);
      this.GetFileInputElement().size = size;
    },
    findInputSize: function (width, fontSize) {
      var spanInput = document.createElement("SPAN");
      document.body.appendChild(spanInput);
      var fakeInput = document.createElement("INPUT");
      fakeInput.type = "file";
      fakeInput.size = 1;
      fakeInput.style.fontSize = fontSize;
      spanInput.appendChild(fakeInput);
      var stepSize = 1;
      while (true) {
        var previousInputWidth = spanInput.offsetWidth;
        fakeInput.size += stepSize;
        if (previousInputWidth == spanInput.offsetWidth) {
          fakeInput.size = 1;
          break;
        }
        if (spanInput.offsetWidth == width) break;
        else if (spanInput.offsetWidth > width) {
          if (stepSize > 1) {
            fakeInput.size -= stepSize;
            stepSize = 1;
          } else {
            fakeInput.size -= 1;
            break;
          }
        } else stepSize *= 2;
      }
      var inputSize = fakeInput.size;
      ASPx.RemoveElement(fakeInput);
      ASPx.RemoveElement(spanInput);
      return inputSize;
    },
    AttachOnChangeHandler: function (fileInput, method) {
      this.AttachOnChangeHandlerCore(fileInput, method);
    },
    Clear: function () {
      ASPxBaseInputView.prototype.Clear.call(this);
      this.supressInputEvent = true;
      this.GetFileInputElement().value = "";
      this.supressInputEvent = false;
    },
  });
  var ASPxErrorView = ASPx.CreateClass(ASPxBaseView, {
    constructor: function (options) {
      this.constructor.prototype.constructor.call(this, options);
    },
    Initialize: function () {
      if (
        this.options.advancedModeEnabled &&
        !this.options.isFileApiAvailable &&
        !this.options.isSLEnabled &&
        !this.options.autoModeEnabled
      )
        this.SetVisiblePlatformErrorElement(true);
      var errorRowTemplate = this.GetErrorRowTemplate();
      if (errorRowTemplate)
        this.errorRowTemplateNode = errorRowTemplate.cloneNode(true);
    },
    GetErrorRowTemplate: function () {
      return this.domHelper.GetChildElement(IdSuffixes.Error.RowTemplate);
    },
    GetErrorRow: function (index) {
      return this.domHelper.GetChildElement(IdSuffixes.Error.Row + index);
    },
    GetErrorCell: function (index) {
      return ASPx.GetNodesByTagName(this.GetErrorRow(index), "td")[0];
    },
    Refresh: function (args) {},
    Clear: function () {
      this.UpdateCommonErrorDiv("");
    },
    UpdateErrorMessageCell: function (args) {
      var index = args.index,
        errorText = args.errorText,
        isValid = args.isValid;
      if (this.GetErrorRow(index)) {
        var errorCell = this.GetErrorCell(index);
        if (errorText instanceof Array) {
          var errorTexts = [];
          for (var i = 0; i < errorText.length; i++)
            if (!isValid[i] && errorText[i] != "")
              errorTexts.push(errorText[i]);
          errorText = errorTexts.join("<br />");
          ASPx.SetElementDisplay(this.GetErrorRow(index), true);
        } else ASPx.SetElementDisplay(this.GetErrorRow(index), !isValid);
        if (errorText != "") errorCell.innerHTML = errorText;
      }
    },
    UpdateCommonErrorDiv: function (text) {
      var commonErrorDiv = this.getCommonErrorDivElement();
      if (commonErrorDiv) commonErrorDiv.innerHTML = text;
      ASPx.SetElementDisplay(commonErrorDiv, !!text.length);
    },
    getCommonErrorDivElement: function () {
      return this.domHelper.GetChildElement(IdSuffixes.Error.Div);
    },
  });
  var ASPxProgressPanelView = ASPx.CreateClass(ASPxBaseView, {
    constructor: function (options) {
      this.constructor.prototype.constructor.call(this, options);
      this.isInCallback = false;
    },
    Initialize: function (options) {
      ASPxBaseView.prototype.Initialize.call(this, options);
      var cancelButton = this.getCancelButton();
      if (cancelButton) {
        this.AttachEventForElement(
          this.getCancelButton(),
          "click",
          function () {
            this.RaiseStateChangedInternal(this);
          }.aspxBind(this)
        );
      }
    },
    prepareInternalStateChangedArgs: function () {
      return {
        uploadCancelled: true,
      };
    },
    OnBeginProcessUploading: function () {
      this.ShowProgressPanel(true);
    },
    ShowProgressPanel: function () {
      window.setTimeout(
        function () {
          if (this.isInCallback) this.ShowProgressInfoPanel(true);
        }.aspxBind(this),
        600
      );
      this.CleanUploadingInfoPanel();
    },
    ShowProgressInfoPanel: function (show) {
      var inputsTable = this.GetUploadInputsTable();
      ASPx.SetStyles(this.GetProgressPanel(), {
        width: inputsTable.clientWidth,
        height: inputsTable.clientHeight,
      });
      ASPx.SetElementDisplay(inputsTable, !show);
      ASPx.SetElementDisplay(this.GetProgressPanel(), show);
      if (!show && ASPx.Browser.Chrome) {
        var _inputsTable = inputsTable;
        window.setTimeout(function () {
          ASPx.SetElementVisibility(_inputsTable, true);
        }, 100);
      }
      if (show) {
        var progressControl = this.GetProgressControl();
        if (progressControl != null) progressControl.AdjustControl();
      }
      this.SetButtonEnabled(this.getCancelButton(), true);
    },
    CleanUploadingInfoPanel: function () {
      this.UpdateProgress(0);
    },
    getCancelButton: function () {
      return this.domHelper.GetChildElement(IdSuffixes.Input.ButtonCell.Cancel);
    },
    OnUploadFilesComplete: function () {
      this.UpdateProgress(100);
      this.ShowProgressInfoPanel(false);
    },
    UpdateProgress: function (args) {
      var percent = args.progress;
      if (!(percent > 0 && percent <= 100)) percent = percent > 0 ? 100 : 0;
      var element = this.GetProgressControl();
      if (element != null) element.SetPosition(percent);
    },
    GetProgressControl: function () {
      if (!this.progressControl) {
        var name = this.GetName() + IdSuffixes.Progress.Control;
        this.progressControl = ASPx.GetControlCollection().Get(name);
      }
      return this.progressControl;
    },
    GetProgressPanel: function () {
      return this.domHelper.GetChildElement(IdSuffixes.Progress.Panel);
    },
  });
  var ASPxDropZoneView = ASPx.CreateClass(ASPxBaseView, {
    constructor: function (options) {
      this.constructor.prototype.constructor.call(this, options);
      this.enabled = true;
      this.externalDropZoneIDList = [];
      this.savedExternalDropZoneIDList = null;
      this.inlineDropZone = null;
      this.inlineDropZoneAnchorElementID =
        options.inlineDropZoneAnchorElementID;
      this.animationStrategy =
        this.animationStrategies[options.dropZoneAnimationType];
      this.DropZoneEnterInternal = new ASPxClientEvent();
      this.DropZoneLeaveInternal = new ASPxClientEvent();
      this.DropZoneDropInternal = new ASPxClientEvent();
      this.fileSystemHelper = new DragAndDropFileSystemHelper();
      this.fileSystemHelper.ProcessingComplete.ClearHandlers();
      this.fileSystemHelper.ProcessingComplete.AddHandler(
        this.onDropEventProcessed.aspxBind(this)
      );
    },
    InlineInitialize: function () {
      if (!this.options.disableInlineDropZone) {
        this.InitializeInlineDropZone();
        if (this.inlineDropZone)
          aspxGetUploadControlCollection().RegisterDropZone(
            this.GetName(),
            this.inlineDropZone.id,
            true
          );
        this.AdjustInlineDropZone();
      }
    },
    Initialize: function () {
      this.SetExternalDropZoneID(this.options.externalDropZoneIDList);
      aspxGetUploadControlCollection().RegisterAnchorElement(
        this.GetName(),
        this.getAnchorElement()
      );
    },
    SetEnabled: function (enabled) {
      if (this.enabled === enabled) return;
      this.setInlineDropZoneEnabled(enabled);
      this.setExternalDropZonesEnabled(enabled);
      this.enabled = enabled;
    },
    setInlineDropZoneEnabled: function (enabled) {
      if (!this.inlineDropZone) return;
      if (enabled) {
        aspxGetUploadControlCollection().RegisterAnchorElement(
          this.GetName(),
          this.getAnchorElement()
        );
        aspxGetUploadControlCollection().RegisterDropZone(
          this.GetName(),
          this.inlineDropZone.id,
          true
        );
      } else {
        aspxGetUploadControlCollection().DeregisterAnchorElement(
          this.getAnchorElement()
        );
        aspxGetUploadControlCollection().DeregisterDropZones(
          this.GetName(),
          [this.inlineDropZone.id],
          true
        );
      }
    },
    setExternalDropZonesEnabled: function (enabled) {
      if (enabled) {
        this.SetExternalDropZoneID(
          this.savedExternalDropZoneIDList || this.externalDropZoneIDList
        );
        this.savedExternalDropZoneIDList = null;
      } else {
        this.savedExternalDropZoneIDList = this.externalDropZoneIDList;
        this.SetExternalDropZoneID();
      }
    },
    SetExternalDropZoneID: function (externalZoneIDList) {
      aspxGetUploadControlCollection().DeregisterDropZones(
        this.GetName(),
        this.externalDropZoneIDList
      );
      this.externalDropZoneIDList = [];
      if (externalZoneIDList && externalZoneIDList.length) {
        ASPx.Data.ForEach(
          externalZoneIDList,
          function (zoneId) {
            aspxGetUploadControlCollection().RegisterDropZone(
              this.GetName(),
              zoneId,
              false
            );
            this.externalDropZoneIDList.push(zoneId);
          }.aspxBind(this)
        );
      }
    },
    AdjustInlineDropZone: function () {
      if (this.options.disableInlineDropZone || !this.inlineDropZone) return;
      var dropZone = this.inlineDropZone,
        anchorElement = this.getAnchorElement(),
        anchorStyle = ASPx.GetCurrentStyle(anchorElement),
        anchorRect = anchorElement.getBoundingClientRect();
      ASPx.Attr.SetAttribute(
        dropZone.style,
        "height",
        anchorElement.offsetHeight + "px"
      );
      ASPx.Attr.SetAttribute(
        dropZone.style,
        "width",
        anchorElement.offsetWidth + "px"
      );
      ASPx.Attr.SetAttribute(dropZone.style, "top", anchorRect.top + "px");
      ASPx.Attr.SetAttribute(dropZone.style, "left", anchorRect.left + "px");
      ASPx.Attr.SetAttribute(dropZone.style, "padding", anchorStyle.padding);
    },
    AdjustSize: function () {
      this.AdjustInlineDropZone();
    },
    InitializeInlineDropZone: function () {
      this.inlineDropZone =
        this.domHelper.GetMainElement().previousElementSibling;
    },
    getAnchorElement: function () {
      if (!this.anchorElement) {
        if (this.inlineDropZoneAnchorElementID)
          this.anchorElement = document.getElementById(
            this.inlineDropZoneAnchorElementID
          );
        else this.anchorElement = this.domHelper.GetMainElement();
      }
      return this.anchorElement;
    },
    SetInlineDropZoneAnchorElementID: function (id) {
      aspxGetUploadControlCollection().DeregisterAnchorElement(
        this.getAnchorElement()
      );
      this.anchorElement = null;
      this.inlineDropZoneAnchorElementID = id;
      aspxGetUploadControlCollection().RegisterAnchorElement(
        this.GetName(),
        this.getAnchorElement()
      );
      this.moveInlineDropZoneToAnchor();
    },
    moveInlineDropZoneToAnchor: function () {
      this.anchorElement.insertBefore(
        this.inlineDropZone,
        this.anchorElement.firstChild
      );
      ASPx.AddClassNameToElement(
        this.inlineDropZone,
        CSSClasses.DropZone.HasExternalAnchor
      );
    },
    refreshBase: function (args) {
      ASPxBaseView.prototype.refreshBase.call(this, args);
      this.AdjustInlineDropZone();
    },
    updateFileInfos: function (args) {
      this.fileInfos = args.fileInfos[0];
    },
    onDropEventProcessed: function (files) {
      this.rawFiles = files;
      if (!this.options.enableMultiSelect && this.rawFiles.length > 1)
        this.raiseError(this.options.dragAndDropMoreThanOneFileError);
      else this.RaiseStateChangedInternal(this);
    },
    OnDrop: function (e, zoneId) {
      this.rawFiles = [];
      this.RaiseDropZoneDropInternal(e, zoneId);
      this.RaiseDropZoneLeave(e, zoneId);
      this.fileSystemHelper.processDataTransfer(e.dataTransfer);
      if (zoneId === this.inlineDropZone.id)
        this.animationStrategy.hide(this.inlineDropZone);
    },
    OnDragLeave: function (e, zoneId) {
      if (this.inlineDropZone && zoneId === this.inlineDropZone.id)
        this.animationStrategy.hide(this.inlineDropZone);
      this.RaiseDropZoneLeave(e, zoneId);
    },
    OnDragEnter: function (e, zoneId) {
      if (zoneId === this.inlineDropZone.id) this.onDragEnterInlineZone();
      this.RaiseDropZoneEnter(e, zoneId);
    },
    onDragEnterInlineZone: function () {
      this.AdjustInlineDropZone();
      this.animationStrategy.show(this.inlineDropZone);
    },
    RaiseDropZoneEnter: function (e, dropZoneId) {
      if (!this.DropZoneEnterInternal.IsEmpty()) {
        var dropZone = document.getElementById(dropZoneId),
          args = new ASPxClientUploadControlDropZoneEnterEventArgs(dropZone);
        this.DropZoneEnterInternal.FireEvent(args);
      }
    },
    RaiseDropZoneLeave: function (e, dropZoneId) {
      if (!this.DropZoneLeaveInternal.IsEmpty()) {
        var dropZone = document.getElementById(dropZoneId),
          args = new ASPxClientUploadControlDropZoneLeaveEventArgs(dropZone);
        this.DropZoneLeaveInternal.FireEvent(args);
      }
    },
    RaiseDropZoneDropInternal: function (e, dropZoneId) {
      if (!this.DropZoneEnterInternal.IsEmpty()) {
        var dropZone = document.getElementById(dropZoneId),
          args = new ASPxClientUploadControlDropZoneDropEventArgs(dropZone);
        this.DropZoneDropInternal.FireEvent(args);
      }
    },
    GetFileInfos: function () {
      var fileInfos = [];
      if (this.fileInfos && this.options.enableMultiSelect)
        fileInfos = this.fileInfos.slice(0);
      ASPx.Data.ForEach(
        this.rawFiles,
        function (file) {
          fileInfos.push(new ASPxFileInfo(file, 0));
        }.aspxBind(this)
      );
      return [fileInfos];
    },
    animationStrategies: {
      None: {
        show: function (dropZone) {
          ASPx.SetElementDisplay(dropZone, true);
        },
        hide: function (dropZone) {
          ASPx.SetElementDisplay(dropZone, false);
        },
      },
      Fade: {
        animationDuration: 250,
        show: function (dropZone) {
          ASPx.AnimationHelper.setOpacity(dropZone, 0);
          ASPx.SetElementDisplay(dropZone, true);
          ASPx.AnimationHelper.fadeIn(dropZone, null, this.animationDuration);
        },
        hide: function (dropZone) {
          ASPx.AnimationHelper.setOpacity(dropZone, 1);
          ASPx.AnimationHelper.fadeOut(
            dropZone,
            function () {
              ASPx.SetElementDisplay(dropZone, false);
            },
            this.animationDuration
          );
        },
      },
    },
  });
  var DragAndDropFileSystemHelper = ASPx.CreateClass(null, {
    constructor: function () {
      this.ProcessingComplete = new ASPxClientEvent();
      this.ValidationComplete = new ASPxClientEvent();
    },
    processDataTransfer: function (dataTransfer) {
      this.files = [];
      if (dataTransfer.items && !ASPx.Browser.Edge)
        this.processWebkitItems(dataTransfer.items);
      else if (dataTransfer.files) this.finalizeProcessing(dataTransfer.files);
    },
    processWebkitItems: function (items) {
      this.callbackCount = 0;
      ASPx.Data.ForEach(
        items,
        function (item) {
          this.processWebkitItem(item);
        }.aspxBind(this)
      );
    },
    processWebkitItem: function (item) {
      if (item.kind == "string") return;
      var entry = item.webkitGetAsEntry();
      if (!entry) return;
      var entries = [entry];
      this.processEntries(entries);
    },
    processEntries: function (entries) {
      ASPx.Data.ForEach(
        entries,
        function (entry) {
          if (entry.isDirectory)
            this.processDirectory(entry.createReader(), this.processEntries);
          else {
            this.callbackCount++;
            entry.file(this.appendFile.aspxBind(this));
          }
        }.aspxBind(this)
      );
    },
    appendFile: function (file) {
      this.callbackCount--;
      this.files.push(file);
      if (this.callbackCount === 0) this.finalizeProcessing(this.files);
    },
    processDirectory: function (directoryReader, callback) {
      var entries = [],
        that = this;
      var readEntries = function () {
        that.callbackCount++;
        directoryReader.readEntries(function (results) {
          that.callbackCount--;
          if (results.length) {
            entries = entries.concat(results.slice(0));
            readEntries();
          } else callback.call(that, entries);
        });
      };
      readEntries();
    },
    finalizeProcessing: function (files) {
      if (this.ValidationComplete.IsEmpty()) {
        this.ValidationComplete.AddHandler(
          function () {
            this.ProcessingComplete.FireEvent(this.validFiles);
          }.aspxBind(this)
        );
      }
      this.validateFiles(files);
    },
    validateFiles: function (files) {
      this.validFiles = files;
      this.callbackCount = 0;
      for (var i = 0; i < files.length; i++) this.validateFile(files[i]);
      if (this.callbackCount === 0) this.ValidationComplete.FireEvent();
    },
    validateFile: function (file) {
      if (
        ASPx.Browser.Firefox &&
        !file.type &&
        file.size <= Constants.FIREFOX_FOLDER_MAX_SIZE
      )
        this.examineFile(file);
    },
    examineFile: function (file) {
      var that = this;
      try {
        var reader = new FileReader();
        reader.onerror = that.onReaderError.aspxBind(that);
        reader.onload = that.onReaderLoad.aspxBind(that);
        this.callbackCount++;
        reader.readAsDataURL(file);
      } catch (e) {
        this.onReaderError();
      }
    },
    onReaderLoad: function () {
      if (--this.callbackCount === 0) this.ValidationComplete.FireEvent();
    },
    onReaderError: function () {
      this.validFiles = [];
      this.ValidationComplete.FireEvent();
    },
  });
  ASPxClientUploadControl.isValidDragAndDropEvent = function (e) {
    var hasFiles = false;
    var typeCount = e.dataTransfer.types.length;
    for (var i = 0; i < typeCount; i++) {
      var type = e.dataTransfer.types[i];
      if (type == "Files") hasFiles = true;
      else {
        var typeIsAllowed = type == "text/plain" || type == "Text";
        if (!typeIsAllowed && ASPx.Browser.Firefox)
          typeIsAllowed =
            type == "application/x-moz-file" || type == "text/x-moz-url";
        if (!typeIsAllowed) return false;
      }
    }
    return hasFiles;
  };
  var ASPxFileInfoCache = ASPx.CreateClass(null, {
    constructor: function () {
      this.fileInfos = [];
      this.FileListChanged = new ASPxClientEvent();
      ASPxFileInfoCache.getPlainArray = this.getPlainArray;
    },
    Update: function (args) {
      this.UpdateFileInfos(args);
      var listChangedArgs = new ASPxFileListChangedInternalArgs(
        this.fileInfos,
        args.inputIndex,
        args.fileCountChanged
      );
      this.RaiseFileListChanged(listChangedArgs);
    },
    UpdateFileInfos: function (args) {
      var currentLength = this.getPlainArray(this.fileInfos).length,
        newLength = this.getPlainArray(args.fileInfos).length;
      args.fileCountChanged = currentLength !== newLength;
      this.fileInfos = args.fileInfos;
    },
    Get: function () {
      return this.getPlainArray(this.fileInfos);
    },
    clear: function () {
      ASPx.Data.ForEach(
        this.fileInfos,
        function (fileInfosArr) {
          fileInfosArr && fileInfosArr.reverse();
          ASPx.Data.ForEach(
            fileInfosArr,
            function (fileInfo) {
              fileInfo.dispose();
            }.aspxBind(this)
          );
        }.aspxBind(this)
      );
      this.Update(ASPxEmptyRefreshArgs);
    },
    getPlainArray: function (complexArray) {
      var result = [];
      ASPx.Data.ForEach(complexArray, function (inputFileInfos) {
        ASPx.Data.ForEach(inputFileInfos, function (fileInfo, fileIndex) {
          fileInfo.fileIndex = fileIndex;
          result.push(fileInfo);
        });
      });
      return result;
    },
    getFileInfosCount: function () {
      var count = 0;
      ASPx.Data.ForEach(
        this.fileInfos,
        function (fileInfos) {
          count += fileInfos.length;
        }.aspxBind(this)
      );
      return count;
    },
    RemoveFile: function (index) {
      var absoluteIndex = 0;
      for (var i = 0; i < this.fileInfos.length; i++) {
        var current = this.fileInfos[i],
          remained = [];
        ASPx.Data.ForEach(current, function (fileInfo) {
          if (absoluteIndex++ === index) fileInfo.dispose();
          else remained.push(fileInfo);
        });
        this.fileInfos[i] = remained.slice();
      }
      var args = {
        fileInfos: this.fileInfos,
        inputIndex: undefined,
      };
      this.Update(args);
    },
    GetFileIndexesCount: function (fileInputCount) {
      var count = 0;
      for (var inputIndex = 0; inputIndex < fileInputCount; inputIndex++) {
        var fileInfos = this.GetFileInfos(inputIndex);
        count += fileInfos.length > 0 ? fileInfos.length : 1;
      }
      return count;
    },
    RaiseFileListChanged: function (args) {
      args.fileInfosCount = this.getFileInfosCount();
      this.FileListChanged.FireEvent(args);
    },
  });
  var ASPxLegacyUploadManager = ASPx.CreateClass(null, {
    constructor: function (options) {
      this.options = options;
      this.isInCallback = false;
      this.isNative = false;
      this.domHelper = options.domHelper;
      this.uploadHelper = options.uploadHelper;
      this.progressHandlerPage = options.progressHandlerPage;
      this.uploadingKey = options.uploadingKey;
      this.name = options.name;
      this.packetSize = options.packetSize;
      this.unspecifiedErrorText = options.unspecifiedErrorText;
      this.validationSettings = options.validationSettings;
      this.InitializeIframe();
      this.FileUploadErrorInternal = new ASPxClientEvent();
      this.UploadInitiatedInternal = new ASPxClientEvent();
      this.InternalError = new ASPxClientEvent();
      this.FileUploadCompleteInternal = new ASPxClientEvent();
      this.FilesUploadCompleteInternal = new ASPxClientEvent();
      this.FileUploadStartInternal = new ASPxClientEvent();
      this.UploadingProgressChangedInternal = new ASPxClientEvent();
      this.InCallbackChangedInternal = new ASPxClientEvent();
      this.NeedSetJSProperties = new ASPxClientEvent();
      this.BeginProcessUploadingInternal = new ASPxClientEvent();
    },
    UploadFileFromUser: function (fileInfos) {
      this.fileInfos = fileInfos;
      this.currentFileIndex = 0;
      this.UploadInitiatedInternal.FireEvent();
      this.isAborted = false;
      this.isCancel = false;
      this.uploadProcessingErrorText = "";
      var validateObj = {
        commonErrorText: "",
        commonCallbackData: "",
      };
      if (!this.isInCallback) {
        if (this.IsFileUploadCanceled(validateObj)) {
          this.isCancel = true;
          this.RaiseFilesUploadCompleteInternal(validateObj);
          return false;
        }
        var isSuccessful = true;
        if (this.IsAdvancedModeEnabled()) this.BeginProcessUploading();
        else {
          isSuccessful = this.UploadForm();
          if (this.IsUploadProcessingEnabled()) this.BeginProcessUploading();
        }
        return true;
      }
    },
    GetUploadInputsTable: function () {
      return this.domHelper.GetChildElement(IdSuffixes.Input.UploadInputsTable);
    },
    IsAdvancedModeEnabled: function () {
      return (
        this.options.advancedModeEnabled &&
        (this.options.isFileApiAvailable || this.options.isSLEnabled)
      );
    },
    CancelUploading: function (isUI) {
      this.cancelUploadingProcess(isUI);
      window.setTimeout(this.UploadAsyncCancelProcessing.aspxBind(this), 100);
    },
    cancelUploadingProcess: function (isUI) {
      if (this.isInCallback) {
        if (isUI) this.isCancel = true;
        else this.isAborted = true;
        var iframeUrl = ASPx.SSLSecureBlankUrl;
        if (ASPx.Browser.Opera)
          this.SetIFrameUrl(
            iframeUrl +
              "&" +
              Constants.QueryParamNames.CANCEL_UPLOAD +
              "=" +
              new Date().valueOf()
          );
        this.SetIFrameUrl(iframeUrl);
        this.EndProcessUploading();
      }
    },
    CancelUploadingFileFromHelper: function () {
      this.cancelUploadingProcess();
    },
    IsRightToLeft: function () {
      return ASPx.IsElementRightToLeft(this.GetMainElement());
    },
    IsUploadProcessingEnabled: function () {
      return this.options.uploadProcessingEnabled;
    },
    CreateXmlHttpRequestObject: function () {
      if (!this.xmlHttpRequest) {
        if (typeof XMLHttpRequest != "undefined")
          this.xmlHttpRequest = new XMLHttpRequest();
        else if (typeof ActiveXObject != "undefined")
          this.xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        this.xmlHttpRequest.onreadystatechange = function () {
          this.UploadAsyncXmlHttpResponse(this.xmlHttpRequest);
        }.aspxBind(this);
      }
      return this.xmlHttpRequest;
    },
    BeginProcessUploading: function () {
      this.TotalFilesLength = this.GetTotalLength();
      this.BeginProcessUploadingInternal.FireEvent();
      this.uploadingTimerID = window.setInterval(
        function () {
          this.UploadProcessing();
        }.aspxBind(this),
        1000
      );
    },
    EndProcessUploading: function () {
      this.uploadingInfo = null;
      if (this.uploadingTimerID != null)
        this.uploadingTimerID = ASPx.Timer.ClearInterval(this.uploadingTimerID);
      if (this.IsAdvancedModeEnabled() && !this.isCancel && !this.isAborted)
        this.UploadForm();
    },
    GetFileIndexesCount: function () {
      return this.fileInfos.length;
    },
    GetHelperRequestData: function () {
      this.currentFileIndex = this.currentFileIndex || 0;
      this.isLastChunk = false;
      var fileInfo = this.fileInfos[this.currentFileIndex] || {},
        currentIndex = this.currentFileIndex,
        startPos = 0,
        requestData = { data: "", isNewFile: !fileInfo.uploadedLength },
        isNewUploading = !(
          currentIndex ||
          !fileInfo ||
          fileInfo.uploadedLength
        ),
        chunkLength;
      if (fileInfo) {
        fileInfo.uploadedLength = fileInfo.uploadedLength || 0;
        startPos = fileInfo.uploadedLength;
        chunkLength = fileInfo.fileSize - fileInfo.uploadedLength;
        if (chunkLength > this.packetSize) {
          chunkLength = this.packetSize;
        } else {
          this.currentFileIndex++;
          if (this.currentFileIndex === this.fileInfos.length) {
            this.isLastChunk = true;
          }
        }
        fileInfo.uploadedLength += chunkLength;
      }
      var fileData = this.uploadHelper.ReadFileData(
        fileInfo.file,
        startPos,
        chunkLength,
        fileInfo.inputIndex,
        fileInfo.fileIndex
      );
      if (fileData.errorText) requestData.errorText = fileData.errorText;
      else {
        requestData.data = this.uploadHelper.BuildChunkRequest(
          isNewUploading,
          this.options.settingsID,
          this.TotalFilesLength,
          fileInfo.inputIndex,
          currentIndex,
          fileInfo.fileSize,
          fileInfo.fileType,
          chunkLength,
          fileInfo.fileName,
          this.options.signature,
          fileData.data
        );
      }
      return requestData;
    },
    GetUploadingInfo: function () {
      if (!this.uploadingInfo) {
        this.uploadingInfo = {
          isUploadingStart: false,
          isComplete: false,
          currentFileName: "",
          currentFileContentLength: 0,
          currentFileUploadedContentLength: 0,
          currentFileProgress: 0,
          currentContentType: "",
          totalUploadedSize: 0,
          totalLength: 0,
          progress: 0,
          errorText: "",
        };
      }
      return this.uploadingInfo;
    },
    GetTotalLength: function () {
      var totalFileLength = 0;
      ASPx.Data.ForEach(this.fileInfos, function (file) {
        totalFileLength += parseInt(file.fileSize);
      });
      return totalFileLength;
    },
    UpdateUploadingInfo: function (responseXML) {
      var info = this.GetUploadingInfo();
      if (
        responseXML == null ||
        this.GetXmlAttribute(responseXML, "empty") == "true"
      ) {
        if (info.isUploadingStart) {
          info.isUploadingStart = false;
          info.isComplete = true;
          info.progress = 100;
          info.totalUploadedSize = info.totalLength;
        }
        return;
      }
      info.isUploadingStart = true;
      info.errorText = this.GetXmlAttribute(responseXML, "errorText");
      info.currentFileName = this.GetXmlAttribute(responseXML, "fileName");
      info.currentFileContentLength = this.GetXmlAttribute(
        responseXML,
        "fileSize"
      );
      info.currentFileUploadedContentLength = this.GetXmlAttribute(
        responseXML,
        "fileUploadedSize"
      );
      info.currentFileProgress = this.GetXmlAttribute(
        responseXML,
        "fileProgress"
      );
      info.currentContentType = this.GetXmlAttribute(
        responseXML,
        "contentType"
      );
      info.totalUploadedSize = parseInt(
        this.GetXmlAttribute(responseXML, "totalUploadedSize")
      );
      info.totalLength = parseInt(
        this.GetXmlAttribute(responseXML, "totalSize")
      );
      info.progress = parseInt(this.GetXmlAttribute(responseXML, "progress"));
    },
    UploadProcessing: function () {
      if (this.isProgressWaiting || this.isResponseWaiting) return;
      this.isProgressWaiting = true;
      var xmlHttp = this.CreateXmlHttpRequestObject();
      if (xmlHttp == null) {
        this.isProgressWaiting = false;
        this.EndProcessUploading();
        return;
      }
      if (!this.GetUploadingInfo().isComplete) {
        var url =
          this.progressHandlerPage +
          "?" +
          Constants.QueryParamNames.PROGRESS_HANDLER +
          "=" +
          this.GetProgressInfoKey();
        var httpMethod = "GET";
        var requestData = { data: "" };
        if (this.IsAdvancedModeEnabled()) {
          url +=
            "&" +
            Constants.QueryParamNames.HELPER_UPLOADING_CALLBACK +
            "=" +
            this.name;
          httpMethod = "POST";
          var previousFileIndex = this.currentFileIndex;
          requestData = this.GetHelperRequestData();
          if (requestData.isNewFile) {
            this.fileInfos[previousFileIndex].OnUploadStart.FireEvent();
          }
          if (requestData.errorText) {
            this.isProgressWaiting = false;
            this.uploadProcessingErrorText = requestData.errorText;
            this.CancelUploadingFileFromHelper();
            return;
          }
        }
        xmlHttp.open(httpMethod, url, true);
        xmlHttp.send(requestData.data);
        this.isResponseWaiting = true;
      } else {
        this.fileInfos[this.currentFileIndex].OnUploadComplete.FireEvent();
        this.EndProcessUploading();
      }
      this.isProgressWaiting = false;
    },
    UploadAsyncXmlHttpResponse: function (xmlHttp) {
      if (xmlHttp && xmlHttp.readyState == 4) {
        var successful = false;
        if (xmlHttp.status == 200) {
          var xmlDoc = this.GetResponseXml(xmlHttp);
          this.UpdateUploadingInfo(xmlDoc);
          var info = this.GetUploadingInfo();
          successful = !info.errorText;
        }
        if (successful) {
          if (info.isUploadingStart || info.isComplete) {
            this.OnUploadingProgressChanged(this.fileInfos.length, info);
          }
        } else {
          if (this.IsAdvancedModeEnabled()) {
            this.uploadProcessingErrorText =
              info && info.errorText != ""
                ? info.errorText
                : xmlHttp.statusText;
            this.isLastChunk = true;
            this.CancelUploadingFileFromHelper();
          }
        }
        var isEndProcessUploading =
          !(this.GetUploadingInfo().isUploadingStart || this.isInCallback) ||
          (this.IsAdvancedModeEnabled() && this.isLastChunk) ||
          this.uploadingTimerID == -1;
        if (isEndProcessUploading) this.EndProcessUploading();
        else if (this.IsAdvancedModeEnabled())
          window.setTimeout(
            function () {
              this.UploadProcessing();
            }.aspxBind(this),
            0
          );
        this.isResponseWaiting = false;
      }
    },
    UploadAsyncCancelProcessing: function () {
      if (this.isResponseWaiting)
        window.setTimeout(this.UploadAsyncCancelProcessing.aspxBind(this), 100);
      else {
        var xmlHttp = this.CreateXmlHttpRequestObject();
        if (xmlHttp && this.IsAdvancedModeEnabled()) {
          var url =
            this.progressHandlerPage +
            "?" +
            Constants.QueryParamNames.PROGRESS_HANDLER +
            "=" +
            this.GetProgressInfoKey();
          url +=
            "&" +
            Constants.QueryParamNames.HELPER_UPLOADING_CALLBACK +
            "=" +
            this.name;
          var cancelRequest = this.uploadHelper.BuildCancelRequest(
            this.options.settingsID,
            this.options.signature
          );
          xmlHttp.open("POST", url, false);
          xmlHttp.send(cancelRequest);
        }
      }
    },
    GetResponseXml: function (xmlHttp) {
      var xmlDoc = xmlHttp.responseXML;
      if (this.IsInvalidXmlDocument(xmlDoc)) {
        var responseContent = this.GetContentFromString(
          xmlHttp.responseText,
          "<",
          ">"
        );
        try {
          xmlDoc = ASPx.Xml.Parse(responseContent);
        } catch (ex) {
          xmlDoc = null;
        }
      }
      return xmlDoc;
    },
    IsInvalidXmlDocument: function (xmlDoc) {
      var ret = xmlDoc == null || xmlDoc.documentElement == null;
      if (!ret) {
        var xmlStr = xmlDoc.documentElement.outerHTML;
        ret = xmlStr && xmlStr.toLowerCase().indexOf("parsererror") > -1;
      }
      return ret;
    },
    GetContentFromString: function (str, startSubstr, endSubstr) {
      var startIndex = str.indexOf(startSubstr),
        endIndex = str.lastIndexOf(endSubstr);
      return str.substring(startIndex, endIndex + 1);
    },
    GetXmlAttribute: function (xmlDoc, attrName) {
      return xmlDoc.documentElement.getAttribute(attrName);
    },
    WriteResponseString: function (responseString) {
      try {
        this.GetFakeIframeDocument().body.innerHTML = responseString;
      } catch (e) {}
    },
    restoreProtectedWhitespaceSeries: function (text) {
      return text.replace(/&nbsp;/g, " ").replace(/&nbspx;/g, "&nbsp;");
    },
    raiseFileUploadErrorInternal: function (errorText, errorType, index) {
      this.FileUploadErrorInternal.FireEvent({
        text: errorText,
        type: errorType,
        inputIndex: index,
      });
    },
    OnCompleteFileUpload: function () {
      var commonErrorText = "";
      var responseObj = this.GetResponseObject();
      if (responseObj) {
        if (responseObj.customJSProperties)
          this.NeedSetJSProperties.FireEvent(responseObj.customJSProperties);
        var indexTable = [];
        ASPx.Data.ForEach(this.fileInfos, function (fileInfo) {
          var index = fileInfo.inputIndex;
          if (!indexTable[index]) indexTable[index] = 1;
          else indexTable[index]++;
        });
        var fileInputCount = this.domHelper.GetFileInputCountInternal();
        for (
          var inputIndex = 0, responseFileIndex = -1;
          inputIndex < fileInputCount;
          inputIndex++
        ) {
          var fileCount = indexTable[inputIndex] || 0;
          if (this.options.enableMultiSelect) {
            var errorTexts = [];
            for (var j = 0; j < fileCount; j++) {
              var eventInputIndex = fileInputCount > 1 ? inputIndex : j;
              responseFileIndex++;
              this.raiseFileUploadCompleteInternal(
                responseFileIndex,
                eventInputIndex,
                responseObj
              );
              if (
                !responseObj.isValidArray[responseFileIndex] &&
                responseObj.errorTexts[responseFileIndex]
              )
                errorTexts.push(responseObj.errorTexts[responseFileIndex]);
            }
            if (errorTexts.length)
              this.raiseFileUploadErrorInternal(
                errorTexts.join("<br />"),
                ASPxUploadErrorTypes.InputRowError,
                inputIndex
              );
          } else {
            responseFileIndex++;
            if (fileCount == 1) {
              if (
                !responseObj.isValidArray[responseFileIndex] &&
                responseObj.errorTexts[responseFileIndex]
              )
                this.raiseFileUploadErrorInternal(
                  responseObj.errorTexts[responseFileIndex],
                  ASPxUploadErrorTypes.InputRowError,
                  inputIndex
                );
              this.raiseFileUploadCompleteInternal(
                responseFileIndex,
                inputIndex,
                responseObj
              );
            }
          }
        }
      }
      if (!this.isCancel) {
        if (responseObj) commonErrorText = responseObj.commonErrorText;
        else if (this.uploadProcessingErrorText != "")
          commonErrorText = this.uploadProcessingErrorText;
        else commonErrorText = this.unspecifiedErrorText;
      } else {
        var currentFileInfo =
          this.fileInfos[this.currentFileIndex] ||
          this.fileInfos[this.currentFileIndex - 1];
        currentFileInfo.OnUploadComplete.FireEvent();
      }
      if (commonErrorText) {
        this.raiseFileUploadErrorInternal(
          commonErrorText,
          ASPxUploadErrorTypes.Common
        );
      }
      this.RaiseInCallbackChange(false);
      if (responseObj) this.RaiseFilesUploadCompleteInternal(responseObj);
      else
        this.RaiseFilesUploadCompleteInternal({
          commonErrorText: commonErrorText,
          commonCallbackData: "",
        });
      if (ASPx.Browser.IE) {
        try {
          this.GetFakeIframeDocument().write("");
          this.GetFakeIframeDocument().close();
        } catch (e) {}
      }
    },
    InitializeIframe: function () {
      if (ASPx.Browser.Opera && !frames[this.GetFakeIframeName()])
        this.ReinitializeIFrame(this.GetFakeIframe());
      this.GetIFrameUrl();
      ASPx.Evt.AttachEventToElement(
        ASPx.Browser.IE ? this.GetFakeIframeElement() : this.GetFakeIframe(),
        "load",
        function () {
          if (this.isInCallback) this.OnCompleteFileUpload();
        }.aspxBind(this)
      );
    },
    ReinitializeIFrame: function (iframe) {
      var divElem = document.createElement("DIV");
      ASPx.SetElementDisplay(divElem, false);
      var parentIframe = iframe.parentNode;
      parentIframe.appendChild(divElem);
      divElem.appendChild(iframe);
    },
    GetFakeIframe: function () {
      var name = this.GetFakeIframeName();
      return ASPx.Browser.IE ? frames[name] : document.getElementById(name);
    },
    GetFakeIframeElement: function () {
      return this.GetFakeIframe().frameElement;
    },
    GetFakeIframeResponseString: function () {
      var html = ASPx.Str.DecodeHtml(
        this.GetFakeIframeDocument().body.innerHTML
      );
      if (ASPx.Browser.IE && ASPx.Browser.Version == 8)
        html = this.restoreProtectedWhitespaceSeries(html);
      return html;
    },
    GetFakeIframeDocument: function () {
      return ASPx.Browser.IE
        ? this.GetFakeIframe().document
        : this.GetFakeIframe().contentDocument;
    },
    GetIFrameUrl: function () {
      if (!this.iframeUrl) {
        var iframe = ASPx.Browser.IE
          ? this.GetFakeIframeElement()
          : this.GetFakeIframe();
        var iframeSrc = ASPx.Attr.GetAttribute(iframe, "src");
        this.iframeUrl = iframeSrc ? iframeSrc : "";
      }
      return this.iframeUrl;
    },
    SetIFrameUrl: function (url) {
      var iframe = ASPx.Browser.IE
        ? this.GetFakeIframeElement()
        : this.GetFakeIframe();
      ASPx.Attr.SetAttribute(iframe, "src", url);
    },
    GetFakeIframeName: function () {
      return this.name + IdSuffixes.Upload.IFrame;
    },
    OnUploadingProgressChanged: function (fileCount, info) {
      this.RaiseUploadingProgressChanged(
        fileCount,
        info.currentFileName,
        info.currentFileContentLength,
        info.currentFileUploadedContentLength,
        info.currentFileProgress,
        info.totalLength,
        info.totalUploadedSize,
        info.progress
      );
      if (
        info.currentFileProgress === "100" &&
        !(this.isCancel || this.isAborted) &&
        this.currentFileIndex
      )
        this.fileInfos[this.currentFileIndex - 1].OnUploadComplete.FireEvent();
    },
    GetProgressInfoKey: function () {
      return this.uploadingKey;
    },
    GetResponseObject: function () {
      var ret = null,
        responseString = "";
      try {
        responseString = this.GetFakeIframeResponseString();
        ret = window.eval(responseString);
      } catch (ex) {
        if (ASPx.Browser.IE)
          this.GetFakeIframe().window.location = this.GetIFrameUrl();
      }
      return this.GetCorrectedResponseObject(ret, responseString);
    },
    GetCorrectedResponseObject: function (responseObj, responseString) {
      if (
        responseObj != null &&
        !responseObj.hasOwnProperty("commonCallbackData")
      ) {
        var responseContent = this.GetContentFromString(
          responseString,
          "(",
          ")"
        );
        try {
          responseObj = window.eval(responseContent);
        } catch (ex) {}
      }
      return responseObj;
    },
    GetUploadFormAction: function (form) {
      var action = form.action;
      if (this.IsAdvancedModeEnabled())
        action = this.AddQueryParamToUrl(
          action,
          Constants.QueryParamNames.PROGRESS_HANDLER,
          this.GetProgressInfoKey()
        );
      else if (this.IsUploadProcessingEnabled())
        action = this.AddQueryParamToUrl(
          action,
          Constants.QueryParamNames.PROGRESS_INFO,
          this.GetProgressInfoKey()
        );
      if (this.IsAdvancedModeEnabled())
        action = this.AddQueryParamToUrl(
          action,
          Constants.QueryParamNames.HELPER_UPLOADING_CALLBACK,
          this.name
        );
      else
        action = this.AddQueryParamToUrl(
          action,
          Constants.QueryParamNames.UPLOADING_CALLBACK,
          this.name
        );
      return action;
    },
    AddQueryParamToUrl: function (url, paramName, paramValue) {
      var prefix = url.indexOf("?") >= 0 ? "&" : "?";
      var paramQueryString = prefix + paramName + "=" + paramValue;
      var anchorStart = url.indexOf("#");
      return anchorStart >= 0
        ? url.substring(0, anchorStart) +
            paramQueryString +
            url.substring(anchorStart)
        : url + paramQueryString;
    },
    GetUploadFormTarget: function (form) {
      return this.GetFakeIframe().name;
    },
    UploadForm: function () {
      var form = this.GetParentForm();
      if (!form) return;
      var sourceTarget = form.target;
      var soureActionString = form.action;
      var sourceMethod = form.method;
      form.action = this.GetUploadFormAction(form);
      form.target = this.GetUploadFormTarget(form);
      form.method = "post";
      var isInternalErrorOccurred = false;
      try {
        form.submit();
      } catch (e) {
        isInternalErrorOccurred = true;
        this.WriteResponseString(
          Constants.ERROR_TEXT_RESPONSE_PREFIX + this.options.generalErrorText
        );
        this.OnCompleteFileUpload();
      }
      form.target = sourceTarget;
      form.action = soureActionString;
      form.method = sourceMethod;
      return !isInternalErrorOccurred;
    },
    IsFileUploadCanceled: function (validateObj) {
      var isCancel = this.RaiseFileUploadStartInternal();
      if (!isCancel) this.RaiseInCallbackChange(true);
      else
        validateObj.commonErrorText = this.options.uploadWasCanceledErrorText;
      return isCancel;
    },
    RaiseInCallbackChange: function (isInCallback) {
      this.isInCallback = isInCallback;
      this.InCallbackChangedInternal.FireEvent(isInCallback);
    },
    RaiseUploadingProgressChanged: function (
      fileCount,
      currentFileName,
      currentFileContentLength,
      currentFileUploadedContentLength,
      currentFileProgress,
      totalContentLength,
      uploadedContentLength,
      progress
    ) {
      if (!this.UploadingProgressChangedInternal.IsEmpty()) {
        var args = new ASPxClientUploadControlUploadingProgressChangedEventArgs(
          fileCount,
          currentFileName,
          currentFileContentLength,
          currentFileUploadedContentLength,
          currentFileProgress,
          totalContentLength,
          uploadedContentLength,
          progress
        );
        this.UploadingProgressChangedInternal.FireEvent(args);
      }
    },
    raiseFileUploadCompleteInternal: function (index, inputIndex, responseObj) {
      if (!this.FileUploadCompleteInternal.IsEmpty()) {
        var args = new ASPxClientUploadControlFileUploadCompleteEventArgs(
          inputIndex,
          responseObj.isValidArray[index],
          responseObj.errorTexts[index],
          responseObj.callbackDataArray[index]
        );
        this.FileUploadCompleteInternal.FireEvent(args);
      }
    },
    RaiseFilesUploadCompleteInternal: function (responseObj) {
      ASPx.Data.ForEach(this.fileInfos, function (fileInfo) {
        fileInfo.uploadedLength = 0;
      });
      var args = {
        commonErrorText: responseObj.commonErrorText,
        commonCallbackData: responseObj.commonCallbackData,
        uploadCancelled: this.isCancel || this.isAborted,
      };
      this.FilesUploadCompleteInternal.FireEvent(args);
    },
    RaiseFileUploadStartInternal: function () {
      var ret = false;
      var args = new ASPxClientUploadControlFilesUploadStartEventArgs(false);
      this.FileUploadStartInternal.FireEvent(args);
      ret = args.cancel;
      return ret;
    },
  });
  var ASPxUploadHelperStandardStrategy = ASPx.CreateClass(null, {
    constructor: function (options) {
      this.domHelper = options.domHelper;
    },
    IsHelperElementReady: function () {
      return true;
    },
  });
  var ASPxUploadHelperHTML5 = ASPx.CreateClass(
    ASPxUploadHelperStandardStrategy,
    {
      constructor: function (options) {
        this.constructor.prototype.constructor.call(this, options);
      },
      FileSlice: function (file, startPos, endPos) {
        if (file.slice) return file.slice(startPos, endPos);
        if (ASPx.Browser.WebKitFamily && file.webkitSlice)
          return file.webkitSlice(startPos, endPos);
        if (ASPx.Browser.NetscapeFamily && file.mozSlice)
          return file.mozSlice(startPos, endPos);
        throw "'File.slice()' method is not implemented";
      },
      ReadFileData: function (file, startPos, chunkLength) {
        var fileData = {};
        if (!chunkLength) return fileData;
        try {
          fileData.data = this.FileSlice(
            file,
            startPos,
            startPos + chunkLength
          );
        } catch (ex) {
          fileData.errorText = "" + ex;
        }
        return fileData;
      },
      RemoveFileInfo: function (inputIndex, fileIndex) {
        var fileInfos = this.GetFileInfos(inputIndex);
        ASPx.Data.ArrayRemoveAt(fileInfos, fileIndex);
      },
      BuildChunkRequest: function (
        isNewUploading,
        settingsID,
        totalSize,
        inputIndex,
        fileIndex,
        fileSize,
        fileType,
        chunkSize,
        fileName,
        signature,
        fileData
      ) {
        var index = fileIndex;
        var formData = new FormData();
        formData.append("IsNewUploading", isNewUploading ? "true" : "false");
        formData.append("SettingsID", settingsID);
        formData.append("TotalSize", totalSize);
        formData.append("FileIndex", index);
        formData.append("FileSize", fileSize);
        formData.append("FileType", fileType);
        formData.append("ChunkSize", chunkSize);
        formData.append("FileName", fileName);
        formData.append("Signature", signature);
        if (chunkSize) formData.append("Data", fileData);
        return formData;
      },
      BuildCancelRequest: function (settingsID, signature) {
        var formData = new FormData();
        formData.append("IsCancel", "true");
        formData.append("SettingsID", settingsID);
        formData.append("Signature", signature);
        return formData;
      },
      UpdateFileInfos: function (inputIndex) {
        var fileInputElement =
          this.uploadControl.GetFileInputElement(inputIndex);
      },
    }
  );
  var ASPxUploadHelperSL = ASPx.CreateClass(ASPxUploadHelperStandardStrategy, {
    constructor: function (options) {
      this.constructor.prototype.constructor.call(this, options);
    },
    SetCursorStyle: function (inputIndex, cursorStyle) {
      if (this.IsHelperElementReady(inputIndex)) {
        var slElement = this.domHelper.GetSlUploadHelperElement(inputIndex);
        slElement.content.sl.SetCursorStyle(cursorStyle);
      }
    },
    ClearFileInfos: function (inputIndex) {
      if (this.IsHelperElementReady(inputIndex)) {
        var slElement = this.domHelper.GetSlUploadHelperElement(inputIndex);
        return slElement.content.sl.ClearFileInfos();
      }
    },
    GetErrorText: function (stringData) {
      var index =
        stringData.indexOf(Constants.ERROR_TEXT_RESPONSE_PREFIX) +
        Constants.ERROR_TEXT_RESPONSE_PREFIX.length;
      return stringData.substr(index);
    },
    GetFileInfos: function (inputIndex) {
      if (this.IsHelperElementReady(inputIndex)) {
        var slElement = this.domHelper.GetSlUploadHelperElement(inputIndex);
        var fileInfos = eval(slElement.content.sl.FileInfos);
        for (var i = 0, count = fileInfos.length; i < count; i++)
          fileInfos[i].fileType = "";
        return fileInfos;
      }
      return [];
    },
    ReadBase64StringData: function (fileIndex, startPos, length, inputIndex) {
      if (this.IsHelperElementReady(inputIndex)) {
        var slElement = this.domHelper.GetSlUploadHelperElement(inputIndex);
        return slElement.content.sl.ReadBase64StringData(
          fileIndex,
          startPos,
          length
        );
      }
      return null;
    },
    ReadFileData: function (
      file,
      startPos,
      chunkLength,
      inputIndex,
      fileIndex
    ) {
      var fileData = {};
      var encodedData = this.ReadBase64StringData(
        fileIndex,
        startPos,
        chunkLength,
        inputIndex
      );
      if (this.IsErrorOccurred(encodedData))
        fileData.errorText = this.GetErrorText(encodedData);
      else fileData.data = encodedData;
      return fileData;
    },
    IsErrorOccurred: function (stringData) {
      return stringData !== null
        ? stringData.indexOf(IdSuffixes.SL.ErrorTextResponsePrefix) != -1
        : true;
    },
    RemoveFileInfo: function (inputIndex, fileIndex) {
      var slElement = this.domHelper.GetSlUploadHelperElement(inputIndex);
      return slElement.content.sl.RemoveFileInfo(fileIndex);
    },
    BuildChunkRequest: function (
      isNewUploading,
      settingsID,
      totalSize,
      inputIndex,
      fileIndex,
      fileSize,
      fileType,
      chunkSize,
      fileName,
      signature,
      fileData
    ) {
      var index = fileIndex;
      var request = "";
      request +=
        "IsNewUploading:" + (isNewUploading ? "true" : "false") + "\r\n";
      request += "SettingsID:" + settingsID + "\r\n";
      request += "TotalSize:" + totalSize + "\r\n";
      request += "FileIndex:" + index + "\r\n";
      request += "FileSize:" + fileSize + "\r\n";
      request += "FileType:" + fileType + "\r\n";
      request += "ChunkSize:" + chunkSize + "\r\n";
      request += "FileName:" + fileName + "\r\n";
      request += "Signature:" + signature + "\r\n";
      request += "EncodingData:" + fileData;
      return request;
    },
    BuildCancelRequest: function (settingsID, signature) {
      var request = "";
      request += "IsCancel:true" + "\r\n";
      request += "SettingsID:" + settingsID + "\r\n";
      request += "Signature:" + signature;
      return request;
    },
    IsHelperElementReady: function (index) {
      return this.domHelper.IsSlObjectLoaded(index);
    },
  });
  var ASPxDOMHelper = ASPx.CreateClass(null, {
    constructor: function (options) {
      this.name = options.name;
      this.stateObject = options.stateObject;
      this.options = options;
      this.isMultiFileInput = false;
    },
    IsMouseOverElement: function (mouseEvt, element) {
      if (!element) return false;
      var x = ASPx.GetAbsoluteX(element);
      var y = ASPx.GetAbsoluteY(element);
      var w = element.offsetWidth;
      var h = element.offsetHeight;
      var eventX = ASPx.Evt.GetEventX(mouseEvt);
      var eventY = ASPx.Evt.GetEventY(mouseEvt);
      return eventX >= x && eventX < x + w && eventY >= y && eventY < y + h;
    },
    GetFileInputCountInternal: function () {
      return this.stateObject.inputCount;
    },
    IsSlObjectLoaded: function (inputIndex) {
      var slElement = this.GetSlUploadHelperElement(inputIndex);
      try {
        if (slElement) {
          if (slElement.content) {
            return !!slElement.content.sl;
          } else if (slElement.Content) {
            return slElement.Content.sl;
          }
        }
      } catch (e) {}
      return false;
    },
    GetFileInputSeparatorRow: function (index) {
      if (
        this.options.fileInputSpacing == "" ||
        this.GetFileInputCountInternal() == 1
      )
        return null;
      return ASPx.GetNodesByPartialClassName(
        this.GetMainElement(),
        CSSClasses.SeparatorRow
      )[index || 0];
    },
    GetAddUploadButtonsSeparatorRow: function () {
      return this.GetChildElement(IdSuffixes.Input.AddButtonsSeparator);
    },
    GetAddUploadButtonsPanelRow: function () {
      return this.GetChildElement(IdSuffixes.Input.AddUploadButtonPanelRow);
    },
    getTooltipValue: function () {
      return ASPx.Attr.GetAttribute(this.GetMainElement(), "title");
    },
  });
  var ASPxClientUploadControlFilesUploadStartEventArgs = ASPx.CreateClass(
    ASPxClientEventArgs,
    {
      constructor: function (cancel) {
        this.constructor.prototype.constructor.call(this);
        this.cancel = cancel;
      },
    }
  );
  var ASPxClientUploadControlFileUploadCompleteEventArgs = ASPx.CreateClass(
    ASPxClientEventArgs,
    {
      constructor: function (inputIndex, isValid, errorText, callbackData) {
        this.constructor.prototype.constructor.call(this);
        this.inputIndex = inputIndex;
        this.isValid = isValid;
        this.errorText = errorText;
        this.callbackData = callbackData;
      },
    }
  );
  var ASPxClientUploadControlFilesUploadCompleteEventArgs = ASPx.CreateClass(
    ASPxClientEventArgs,
    {
      constructor: function (errorText, callbackData) {
        this.constructor.prototype.constructor.call(this);
        this.errorText = errorText;
        this.callbackData = callbackData;
      },
    }
  );
  var ASPxClientUploadControlTextChangedEventArgs = ASPx.CreateClass(
    ASPxClientEventArgs,
    {
      constructor: function (inputIndex) {
        this.constructor.prototype.constructor.call(this);
        this.inputIndex = inputIndex;
      },
    }
  );
  var ASPxClientUploadControlUploadingProgressChangedEventArgs =
    ASPx.CreateClass(ASPxClientEventArgs, {
      constructor: function (
        fileCount,
        currentFileName,
        currentFileContentLength,
        currentFileUploadedContentLength,
        currentFileProgress,
        totalContentLength,
        uploadedContentLength,
        progress
      ) {
        this.constructor.prototype.constructor.call(this);
        this.fileCount = fileCount;
        this.currentFileName = currentFileName;
        this.currentFileContentLength = currentFileContentLength;
        this.currentFileUploadedContentLength =
          currentFileUploadedContentLength;
        this.currentFileProgress = currentFileProgress;
        this.totalContentLength = totalContentLength;
        this.uploadedContentLength = uploadedContentLength;
        this.progress = progress;
      },
    });
  var ASPxClientUploadControlDropZoneEnterEventArgs = ASPx.CreateClass(
    ASPxClientEventArgs,
    {
      constructor: function (dropZone) {
        this.constructor.prototype.constructor.call(this);
        this.dropZone = dropZone;
      },
    }
  );
  var ASPxClientUploadControlDropZoneLeaveEventArgs = ASPx.CreateClass(
    ASPxClientEventArgs,
    {
      constructor: function (dropZone) {
        this.constructor.prototype.constructor.call(this);
        this.dropZone = dropZone;
      },
    }
  );
  var ASPxClientUploadControlDropZoneDropEventArgs = ASPx.CreateClass(
    ASPxClientEventArgs,
    {
      constructor: function (dropZone) {
        this.constructor.prototype.constructor.call(this);
        this.dropZone = dropZone;
      },
    }
  );
  var windowsFileNameRegExpTemplate =
    '^([a-zA-Z]\\:|\\\\\\\\[^\\/\\\\:*?\\"<>|]+\\\\[^\\/\\\\:*?\\"<>|]+)(\\\\[^\\/\\\\:*?\\"<>|]+)+(\\.[^\\/\\\\:*?\\"<>|]+)?$';
  var windowsRootDirectoryNameRegExpTemplate = "[a-zA-Z]\\:";
  ASPxClientUploadControl.IsValidWindowsFileName = function (fileName) {
    var windowsRootDirectoryNameRegExp = new RegExp(
      windowsRootDirectoryNameRegExpTemplate,
      "gi"
    );
    var windowsFileNameRegExp = new RegExp(windowsFileNameRegExpTemplate, "gi");
    return (
      fileName == "" ||
      windowsFileNameRegExp.test(fileName) ||
      (fileName.length == 3 && windowsRootDirectoryNameRegExp.test(fileName))
    );
  };
  ASPxClientUploadControl.UploadManagerClass = ASPxLegacyUploadManager;
  ASPxClientUploadControl.IsDragAndDropAvailable = function () {
    var unsupportedIE = ASPx.Browser.IE && ASPx.Browser.MajorVersion < 10;
    return (
      "draggable" in document.createElement("span") &&
      ASPxClientUploadControl.IsFileApiAvailable() &&
      !unsupportedIE
    );
  };
  ASPxClientUploadControl.IsFileApiAvailable = function () {
    if (ASPxClientUploadControl.fileApiAvailable === undefined) {
      var input = document.createElement("input"),
        isBuggyAndroid =
          ASPx.Browser.AndroidDefaultBrowser &&
          "webkitSlice" in window.File.prototype;
      ASPxClientUploadControl.fileApiAvailable =
        "multiple" in input && "File" in window && "FormData" in window;
      ASPxClientUploadControl.fileApiAvailable =
        ASPxClientUploadControl.fileApiAvailable &&
        !isBuggyAndroid &&
        ("slice" in window.File.prototype ||
          (ASPx.Browser.WebKitFamily &&
            "webkitSlice" in window.File.prototype) ||
          (ASPx.Browser.NetscapeFamily && "mozSlice" in window.File.prototype));
    }
    return ASPxClientUploadControl.fileApiAvailable;
  };
  ASPxClientUploadControl.OnTooManyFilesError = function (name) {
    var uploader = ASPx.GetControlCollection().Get(name);
    if (uploader != null) uploader.ShowTooManyFilesError();
  };
  ASPx.SLOnLoad = function (name, index) {
    var uploader = ASPx.GetControlCollection().Get(name);
    if (uploader != null) uploader.OnPluginLoaded(index);
  };
  ASPx.SLOnError = function (name, index) {
    var uploader = ASPx.GetControlCollection().Get(name);
    if (uploader != null) uploader.OnPluginError(index);
  };
  ASPx.SLOnFileSelectionChanged = function (name, index) {
    var uploader = ASPx.GetControlCollection().Get(name);
    if (uploader != null) uploader.InvokeTextChangedInternal(index);
  };
  var ASPxClientUploadControlCollection = ASPx.CreateClass(
    ASPxClientControlCollection,
    {
      constructor: function () {
        this.constructor.prototype.constructor.call(this);
        this.dropZoneList = [];
        this.dropZoneRegistry = {};
        this.controlDropZonesRegistry = {};
        this.inlineZoneRegistry = {};
        this.anchorElements = [];
        this.anchorElementRegistry = {};
        this.zoneHandlersList = {};
        this.triggersSubscriptions = {};
        this.activeZoneId = null;
        this.dropEffect = "none";
        this.domHelper = new ASPxDOMHelper({ name: this.name });
        this.lastEventTimeStamp = 0;
        this.lastEventName = null;
        this.eventsInitialized = false;
        this.hasActiveDragFiles = false;
        this.disableDragAndDrop = false;
        this.dialogObservationActivated = false;
        this.dialogObservationHandler = null;
      },
      GetCollectionType: function () {
        return "Upload";
      },
      Remove: function (element) {
        this.unsubscribeControl(element.name);
        ASPxClientControlCollection.prototype.Remove.call(this, element);
      },
      RegisterDropZone: function (controlName, zoneId, isInline) {
        if (zoneId) {
          if (this.isRegistered(zoneId))
            this.unsubscribeDropZone(zoneId, controlName);
          this.dropZoneList.push(zoneId);
          this.dropZoneRegistry[zoneId] = controlName;
          this.ensureDropZoneRegistered(controlName, zoneId);
          if (isInline) this.inlineZoneRegistry[controlName] = zoneId;
          this.subscribeDropZone(zoneId, controlName);
        }
      },
      DeregisterDropZones: function (controlName, zoneIDs) {
        if (!(zoneIDs && zoneIDs.length)) return;
        ASPx.Data.ForEach(
          zoneIDs,
          function (zoneId) {
            this.unsubscribeDropZone(zoneId, controlName);
            var pos =
              this.controlDropZonesRegistry[controlName].indexOf(zoneId);
            if (pos > -1)
              this.controlDropZonesRegistry[controlName].splice(pos, 1);
          }.aspxBind(this)
        );
      },
      ensureDropZoneRegistered: function (controlName, zoneId) {
        if (!this.controlDropZonesRegistry[controlName])
          this.controlDropZonesRegistry[controlName] = [];
        if (this.controlDropZonesRegistry[controlName].indexOf(zoneId) === -1)
          this.controlDropZonesRegistry[controlName].push(zoneId);
      },
      isRegistered: function (zoneId) {
        return this.dropZoneList.indexOf(zoneId) !== -1;
      },
      RegisterAnchorElement: function (controlName, anchor) {
        this.anchorElements.push(anchor.id);
        this.anchorElementRegistry[anchor.id] = controlName;
        this.subscribeAnchorElement(anchor);
      },
      DeregisterAnchorElement: function (anchor) {
        if (anchor) {
          if (anchor.id) {
            this.anchorElements.splice(
              this.anchorElements.indexOf(anchor.id),
              1
            );
            delete this.anchorElementRegistry[anchor.id];
          }
          ASPx.Evt.DetachEventFromElement(anchor, "dragleave");
        }
      },
      subscribeAnchorElement: function (anchor) {
        var controlName = this.anchorElementRegistry[anchor.id],
          inlineZoneId = this.inlineZoneRegistry[controlName];
        ASPx.Evt.AttachEventToElement(
          anchor,
          "dragleave",
          function (e) {
            this.onDropZoneLeave(e, inlineZoneId);
          }.aspxBind(this)
        );
      },
      subscribeDropZone: function (zoneId) {
        var dropZone = document.getElementById(zoneId),
          handlerIndex = zoneId,
          that = this;
        if (dropZone) {
          var dropHandler = function (e) {
            that.onDrop(e, zoneId);
          };
          var dragLeaveHandler = function (e) {
            that.onDropZoneLeave(e, zoneId);
          };
          this.zoneHandlersList[handlerIndex] = {
            drop: dropHandler,
            dragleave: dragLeaveHandler,
          };
          ASPx.Evt.AttachEventToElement(
            dropZone,
            "drop",
            this.zoneHandlersList[handlerIndex].drop
          );
          ASPx.Evt.AttachEventToElement(
            dropZone,
            "dragleave",
            this.zoneHandlersList[handlerIndex].dragleave
          );
        }
      },
      unsubscribeDropZone: function (zoneId) {
        var dropZone = document.getElementById(zoneId),
          handlerIndex = zoneId;
        if (dropZone) {
          ASPx.Evt.DetachEventFromElement(
            dropZone,
            "drop",
            this.zoneHandlersList[handlerIndex].drop
          );
          ASPx.Evt.DetachEventFromElement(
            dropZone,
            "dragleave",
            this.zoneHandlersList[handlerIndex].dragleave
          );
          this.dropZoneList.splice(this.dropZoneList.indexOf(zoneId), 1);
          delete this.zoneHandlersList[handlerIndex];
        }
      },
      setDropEffect: function (e, effect) {
        e.dataTransfer.dropEffect = effect;
      },
      isMouseOverElement: function (e, element) {
        if (!element) return false;
        var x = this.getElementAbsoluteX(element),
          w = element.offsetWidth,
          eventX = ASPx.Evt.GetEventX(e);
        if (eventX < x || eventX >= x + w) return false;
        var y = this.getElementAbsoluteY(element),
          h = element.offsetHeight,
          eventY = ASPx.Evt.GetEventY(e);
        return eventY >= y && eventY < y + h;
      },
      getElementAbsoluteX: function (element) {
        if (ASPx.Browser.WebKitFamily)
          return Math.round(
            element.getBoundingClientRect().left + ASPx.GetDocumentScrollLeft()
          );
        else return ASPx.GetAbsoluteX(element);
      },
      getElementAbsoluteY: function (element) {
        if (ASPx.Browser.WebKitFamily)
          return Math.round(
            element.getBoundingClientRect().top + ASPx.GetDocumentScrollTop()
          );
        else return ASPx.GetAbsoluteY(element);
      },
      isActiveZoneChanged: function (e, zoneId) {
        var zoneChanged =
          this.activeZoneId === null || this.activeZoneId !== zoneId;
        if (this.activeZoneId !== null) {
          zoneChanged = this.isMouseLeftActiveZone(e);
        }
        return zoneChanged;
      },
      isMouseLeftActiveZone: function (e) {
        var activeZone = document.getElementById(this.activeZoneId);
        return !this.isMouseOverElement(e, activeZone);
      },
      isInstanceAlive: function (controlName) {
        return (
          this.elements[controlName] &&
          this.elements[controlName].GetMainElement()
        );
      },
      getElementUnderPointerFromList: function (e, list) {
        var ret = null;
        list = list.filter(function (id) {
          return document.getElementById(id) !== null;
        });
        for (var i = 0; i < list.length; i++) {
          var element = document.getElementById(list[i]);
          if (this.isMouseOverElement(e, element)) {
            ret = element;
            break;
          }
        }
        return ret;
      },
      OnDocumentMouseUp: function (e) {
        this.ForEachControl(function (control) {
          if (control.IsDOMInitialized()) control.OnDocumentMouseUp();
        });
      },
      unsubscribeControl: function (controlName) {
        this.DeregisterDropZones(
          controlName,
          this.controlDropZonesRegistry[controlName]
        );
        delete this.controlDropZonesRegistry[controlName];
        this.detachTriggersFromControl(controlName);
      },
      proxyEvent: function (controlName, handler) {
        if (this.isInstanceAlive(controlName)) handler.call(this);
        else this.unsubscribeControl(controlName);
      },
      proxyTriggerEvent: function (controlName, handler) {
        if (!this.hasActiveDragFiles) this.proxyEvent(controlName, handler);
      },
      OnDocumentDragEnter: function (e) {
        ASPx.Evt.PreventEvent(e);
        if (
          !this.disableDragAndDrop &&
          ASPxClientUploadControl.isValidDragAndDropEvent(e)
        ) {
          var anchorElement = this.getElementUnderPointerFromList(
              e,
              this.anchorElements
            ),
            zone,
            zoneId,
            controlName;
          if (anchorElement) {
            controlName = this.anchorElementRegistry[anchorElement.id];
            zoneId = this.inlineZoneRegistry[controlName];
          } else {
            zone = this.getElementUnderPointerFromList(e, this.dropZoneList);
            if (zone) {
              zoneId = zone.id;
              controlName = this.dropZoneRegistry[zoneId];
            }
          }
          if (controlName && zoneId) this.onDragEnter(e, controlName, zoneId);
        } else this.dropEffect = "none";
      },
      onDragEnter: function (e, controlName, zoneId) {
        this.lastEventName = "dragenter";
        if (this.isActiveZoneChanged(e, zoneId)) {
          if (this.activeZoneId) this.onDropZoneLeave(e, this.activeZoneId);
          if (this.activeZoneId !== zoneId) {
            this.proxyEvent(controlName, function () {
              this.passDragEnterToControl(e, controlName, zoneId);
            });
          }
        }
      },
      passDragEnterToControl: function (e, controlName, zoneId) {
        if (!this.elements[controlName].isInCallback) {
          this.elements[controlName].OnDragEnter([e, zoneId]);
          this.activeZoneId = zoneId;
          this.dropEffect = "copy";
        } else this.dropEffect = "none";
      },
      onDropZoneLeave: function (e, zoneId) {
        var zone = document.getElementById(zoneId),
          controlName = this.dropZoneRegistry[zoneId];
        this.hasActiveDragFiles = false;
        if (this.shouldRaiseDragLeave(e, zoneId, zone)) {
          this.proxyEvent(controlName, function () {
            this.elements[controlName].OnDragLeave([e, zoneId]);
          });
          this.activeZoneId = null;
          this.dropEffect = "none";
        }
        ASPx.Evt.PreventEvent(e);
      },
      shouldRaiseDragLeave: function (e, zoneId, zone) {
        return (
          this.activeZoneId === zoneId &&
          (this.isActiveZoneLeft(e, zone) || this.dragCancelledByEscKey())
        );
      },
      isActiveZoneLeft: function (e, zone) {
        return !this.isMouseOverElement(e, zone);
      },
      dragCancelledByEscKey: function () {
        return this.lastEventName !== "dragenter";
      },
      onDrop: function (e, zoneId) {
        var controlName = this.dropZoneRegistry[zoneId];
        this.hasActiveDragFiles = false;
        ASPx.Evt.PreventEvent(e);
        if (
          ASPxClientUploadControl.isValidDragAndDropEvent(e) &&
          this.lastEventTimeStamp !== e.timeStamp
        ) {
          this.proxyEvent(controlName, function () {
            this.elements[controlName].OnDrop([e, zoneId]);
          });
          this.activeZoneId = null;
          this.lastEventTimeStamp = e.timeStamp;
        }
      },
      OnDocumentDragOver: function (e) {
        this.lastEventName = "dragover";
        this.setDropEffect(e, this.dropEffect);
        ASPx.Evt.PreventEvent(e);
      },
      initializeEvents: function () {
        var that = this;
        if (!this.eventsInitialized) {
          ASPx.Evt.AttachEventToDocument("dragenter", function (e) {
            that.hasActiveDragFiles = true;
            that.OnDocumentDragEnter(e);
          });
          ASPx.Evt.AttachEventToDocument("dragover", function (e) {
            that.OnDocumentDragOver(e);
          });
          this.eventsInitialized = true;
        }
      },
      SubscribeDialogTriggers: function (
        context,
        controlName,
        dialogTriggersList,
        triggerHandlers,
        attach
      ) {
        var config = {
          controlName: controlName,
          dialogTriggersList: dialogTriggersList,
          triggerHandlers: triggerHandlers,
          context: context,
        };
        this.detachTriggersFromControl(config.controlName);
        if (attach) this.attachTriggersToControl(config);
      },
      attachTriggersToControl: function (config) {
        this.triggersSubscriptions[config.controlName] = {};
        ASPx.Data.ForEach(
          config.dialogTriggersList,
          function (trigger) {
            this.subscribeTrigger(
              config.controlName,
              trigger,
              config.triggerHandlers,
              config.context
            );
          }.aspxBind(this)
        );
      },
      detachTriggersFromControl: function (controlName) {
        var controlSubscriptions = this.triggersSubscriptions[controlName],
          triggerIDs = ASPx.GetObjectKeys(controlSubscriptions);
        ASPx.Data.ForEach(triggerIDs, function (triggerID) {
          var triggerSubscriptions = controlSubscriptions[triggerID];
          if (triggerSubscriptions) {
            var eventNames = ASPx.GetObjectKeys(triggerSubscriptions);
            ASPx.Data.ForEach(eventNames, function (eventName) {
              ASPx.Data.ForEach(
                triggerSubscriptions[eventName],
                function (subscription) {
                  ASPx.Evt.DetachEventFromElement(
                    subscription.target,
                    eventName,
                    subscription.handler
                  );
                }
              );
              triggerSubscriptions[eventName] = {};
            });
          }
        });
      },
      subscribeTrigger: function (
        controlName,
        trigger,
        triggerHandlers,
        context
      ) {
        var triggerSubscriptions = (this.triggersSubscriptions[controlName][
            trigger.id
          ] = {}),
          eventNames = ASPx.GetObjectKeys(triggerHandlers),
          that = this;
        ASPx.Data.ForEach(
          eventNames,
          function (eventName) {
            triggerSubscriptions[eventName] =
              triggerSubscriptions[eventName] || [];
            ASPx.Data.ForEach(triggerHandlers[eventName], function (config) {
              var handler = function (e) {
                that.proxyTriggerEvent(controlName, function () {
                  config.handler.call(context, e, trigger);
                });
              };
              triggerSubscriptions[eventName].push({
                handler: handler,
                target: config.target || trigger,
              });
            });
            ASPx.Data.ForEach(
              triggerSubscriptions[eventName],
              function (subscription) {
                ASPx.Evt.AttachEventToElement(
                  subscription.target,
                  eventName,
                  subscription.handler
                );
              }
            );
          }.aspxBind(this)
        );
      },
      onFileInputClick: function () {
        this.disableDragAndDrop = true;
        if (ASPx.Browser.Firefox) this.startDialogObservation();
      },
      onFileInputGotFocus: function () {
        this.disableDragAndDrop = false;
      },
      onFileInputChange: function () {
        this.disableDragAndDrop = false;
        this.stopDialogObservation();
      },
      onFileInputLostFocus: function () {
        this.enableDragAndDropAfterDialogClosed();
      },
      onDocumentMouseMove: function (evt) {
        this.enableDragAndDropAfterDialogClosed();
      },
      enableDragAndDropAfterDialogClosed: function () {
        if (this.dialogObservationActivated) {
          this.disableDragAndDrop = false;
          this.stopDialogObservation();
        }
      },
      startDialogObservation: function () {
        if (this.dialogObservationActivated) return;
        this.dialogObservationHandler = this.onDocumentMouseMove.aspxBind(this);
        ASPx.Evt.AttachEventToDocument(
          "mousemove",
          this.dialogObservationHandler
        );
        this.dialogObservationActivated = true;
      },
      stopDialogObservation: function () {
        if (!this.dialogObservationActivated) return;
        ASPx.Evt.DetachEventFromDocument(
          "mousemove",
          this.dialogObservationHandler
        );
        this.dialogObservationHandler = null;
        this.dialogObservationActivated = false;
      },
    }
  );
  var uploadControlCollection = null;
  function aspxGetUploadControlCollection() {
    if (uploadControlCollection == null)
      uploadControlCollection = new ASPxClientUploadControlCollection();
    return uploadControlCollection;
  }
  ASPx.Evt.AttachEventToDocument("mouseup", function (e) {
    aspxGetUploadControlCollection().OnDocumentMouseUp(e);
  });
  var ASPxFileListChangedInternalArgs = ASPx.CreateClass(ASPxClientEventArgs, {
    constructor: function (fileInfos, inputIndex, fileCountChanged) {
      this.fileInfos = fileInfos;
      this.inputIndex = inputIndex;
      this.fileCountChanged = fileCountChanged;
    },
  });
  var ASPxViewStateChangedInternalArgs = ASPx.CreateClass(ASPxClientEventArgs, {
    constructor: function (fileInfos, inputIndex) {
      this.constructor.prototype.constructor.call(this);
      this.fileInfos = fileInfos;
      this.inputIndex = inputIndex;
    },
  });
  window.ASPxClientUploadControl = ASPxClientUploadControl;
  window.ASPxClientUploadControlCollection = ASPxClientUploadControlCollection;
  window.ASPxClientUploadControlFilesUploadStartEventArgs =
    ASPxClientUploadControlFilesUploadStartEventArgs;
  window.ASPxClientUploadControlFileUploadCompleteEventArgs =
    ASPxClientUploadControlFileUploadCompleteEventArgs;
  window.ASPxClientUploadControlFilesUploadCompleteEventArgs =
    ASPxClientUploadControlFilesUploadCompleteEventArgs;
  window.ASPxClientUploadControlTextChangedEventArgs =
    ASPxClientUploadControlTextChangedEventArgs;
  window.ASPxClientUploadControlUploadingProgressChangedEventArgs =
    ASPxClientUploadControlUploadingProgressChangedEventArgs;
})();
(function () {
  var DateFormatter = ASPx.CreateClass(null, {
    constructor: function () {
      this.date = new Date(2000, 0, 1);
      this.mask;
      this.specifiers = {};
      this.spPositions = [];
      this.knownSpecifiers = [
        "d",
        "M",
        "y",
        "H",
        "h",
        "m",
        "s",
        "f",
        "F",
        "g",
        "t",
      ];
      this.savedYear = -1;
      this.isYearParsed = false;
      this.parsedMonth = -1;
      this.replacers = {
        d: this.ReplaceDay,
        M: this.ReplaceMonth,
        y: this.ReplaceYear,
        H: this.ReplaceHours23,
        h: this.ReplaceHours12,
        m: this.ReplaceMinutes,
        s: this.ReplaceSeconds,
        F: this.ReplaceMsTrimmed,
        f: this.ReplaceMs,
        g: this.ReplaceEra,
        t: this.ReplaceAmPm,
      };
      this.parsers = {
        d: this.ParseDay,
        M: this.ParseMonth,
        y: this.ParseYear,
        H: this.ParseHours,
        h: this.ParseHours,
        m: this.ParseMinutes,
        s: this.ParseSeconds,
        F: this.ParseMs,
        f: this.ParseMs,
        g: this.ParseEra,
        t: this.ParseAmPm,
      };
    },
    Format: function (date) {
      this.date = date;
      var sp;
      var pos;
      var replacerKey;
      var result = this.mask;
      for (var i = 0; i < this.spPositions.length; i++) {
        pos = this.spPositions[i];
        sp = this.specifiers[pos];
        replacerKey = sp.substr(0, 1);
        if (this.replacers[replacerKey]) {
          result =
            result.substr(0, pos) +
            this.replacers[replacerKey].call(this, sp.length) +
            result.substr(pos + sp.length);
        }
      }
      return result;
    },
    Parse: function (str) {
      var now = new Date();
      this.savedYear = now.getFullYear();
      this.isYearParsed = false;
      this.parsedMonth = -1;
      this.date = new Date(2000, 0, now.getDate());
      this.strToParse = str;
      this.catchNumbers(str);
      var parserKey;
      var sp;
      var pos;
      var parseResult;
      var error = false;
      this.hasAmPm = false;
      for (var i = 0; i < this.spPositions.length; i++) {
        pos = this.spPositions[i];
        sp = this.specifiers[pos];
        parserKey = sp.substr(0, 1);
        if (this.parsers[parserKey]) {
          parseResult = this.parsers[parserKey].call(this, sp.length);
          if (!parseResult) {
            error = true;
            break;
          }
        }
      }
      if (error) return false;
      if (this.hasAmPm) {
        if (!this.fixHours()) return false;
      }
      if (!this.isYearParsed) this.date.setYear(this.savedYear);
      if (this.parsedMonth < 0) this.parsedMonth = now.getMonth();
      this.ApplyMonth();
      return this.date;
    },
    ApplyMonth: function () {
      var trial;
      var day = this.date.getDate();
      while (true) {
        trial = new Date();
        trial.setTime(this.date.getTime());
        trial.setMonth(this.parsedMonth);
        if (trial.getMonth() == this.parsedMonth) break;
        --day;
        this.date.setDate(day);
      }
      ASPx.DateUtils.FixTimezoneGap(this.date, trial);
      this.date = trial;
    },
    SetFormatString: function (mask) {
      if (mask.length == 2 && mask.charAt(0) == "%") mask = mask.charAt(1);
      this.specifiers = {};
      this.spPositions = [];
      this.mask = "";
      var subt = 0;
      var pos = 0;
      var startPos = 0;
      var ch;
      var prevCh = "";
      var skip = false;
      var backslash = false;
      var sp = "";
      while (true) {
        ch = mask.charAt(pos);
        if (ch == "") {
          if (sp.length > 0) this.RegisterSpecifier(startPos, sp);
          break;
        }
        if (ch == "\\" && !backslash) {
          backslash = true;
          subt++;
        } else {
          if (!backslash && (ch == "'" || ch == '"')) {
            skip = !skip;
            subt++;
          } else {
            if (!skip) {
              if (ch == "/") ch = ASPx.CultureInfo.ds;
              else if (ch == ":") ch = ASPx.CultureInfo.ts;
              else if (this.IsKnownSpecifier(ch)) {
                if (prevCh.length == 0) prevCh = ch;
                if (ch == prevCh) sp += ch;
                else {
                  if (sp.length > 0) this.RegisterSpecifier(startPos, sp);
                  sp = ch;
                  startPos = pos - subt;
                }
              }
            }
            this.mask += ch;
          }
          backslash = false;
        }
        prevCh = ch;
        pos++;
      }
      this.spPositions.reverse();
    },
    RegisterSpecifier: function (pos, sp) {
      this.spPositions.push(pos);
      this.specifiers[pos] = sp;
    },
    ReplaceDay: function (length) {
      if (length < 3) {
        var value = this.date.getDate().toString();
        return length == 2 ? this.padLeft(value, 2) : value;
      } else if (length == 3) {
        return ASPx.CultureInfo.abbrDayNames[this.date.getDay()];
      } else {
        return ASPx.CultureInfo.dayNames[this.date.getDay()];
      }
    },
    ReplaceMonth: function (length) {
      var value = 1 + this.date.getMonth();
      switch (length) {
        case 1:
          return value.toString();
        case 2:
          return this.padLeft(value.toString(), 2);
        case 3:
          return ASPx.CultureInfo.abbrMonthNames[value - 1];
        default:
          for (var i in this.specifiers) {
            var spec = this.specifiers[i];
            if (spec == "d" || spec == "dd")
              return ASPx.CultureInfo.genMonthNames[value - 1];
          }
          return ASPx.CultureInfo.monthNames[value - 1];
      }
    },
    ReplaceYear: function (length) {
      var value = this.date.getFullYear();
      if (length <= 2) value = value % 100;
      return this.padLeft(value.toString(), length);
    },
    ReplaceHours23: function (length) {
      var value = this.date.getHours().toString();
      return length > 1 ? this.padLeft(value, 2) : value;
    },
    ReplaceHours12: function (length) {
      var value = this.date.getHours() % 12;
      if (value == 0) value = 12;
      value = value.toString();
      return length > 1 ? this.padLeft(value, 2) : value;
    },
    ReplaceMinutes: function (length) {
      var value = this.date.getMinutes().toString();
      return length > 1 ? this.padLeft(value, 2) : value;
    },
    ReplaceSeconds: function (length) {
      var value = this.date.getSeconds().toString();
      return length > 1 ? this.padLeft(value, 2) : value;
    },
    ReplaceMsTrimmed: function (length) {
      return this.formatMs(length, true);
    },
    ReplaceMs: function (length) {
      return this.formatMs(length, false);
    },
    ReplaceEra: function (length) {
      return "A.D.";
    },
    ReplaceAmPm: function (length) {
      var value =
        this.date.getHours() < 12 ? ASPx.CultureInfo.am : ASPx.CultureInfo.pm;
      return length < 2 ? value.charAt(0) : value;
    },
    catchNumbers: function (str) {
      this.parseNumbers = [];
      var regex = /\d+/g;
      var match;
      for (;;) {
        match = regex.exec(str);
        if (!match) break;
        this.parseNumbers.push(this.parseDecInt(match[0]));
      }
      var spCount = 0;
      var now = new Date();
      for (var i in this.specifiers) {
        var sp = this.specifiers[i];
        if (sp.constructor != String || !this.IsNumericSpecifier(sp)) continue;
        spCount++;
        if (this.parseNumbers.length < spCount) {
          var defaultValue = 0;
          if (sp.charAt(0) == "y") defaultValue = now.getFullYear();
          this.parseNumbers.push(defaultValue);
        }
      }
      var excess = this.parseNumbers.length - spCount;
      if (excess > 0) this.parseNumbers.splice(spCount, excess);
      this.currentParseNumber = this.parseNumbers.length - 1;
    },
    popParseNumber: function () {
      return this.parseNumbers[this.currentParseNumber--];
    },
    findAbbrMonth: function () {
      return this.findMonthCore(ASPx.CultureInfo.abbrMonthNames);
    },
    findFullMonth: function () {
      return this.findMonthCore(ASPx.CultureInfo.genMonthNames);
    },
    findMonthCore: function (monthNames) {
      var inputLower = this.strToParse.toLowerCase();
      for (var i = 0; i < monthNames.length; i++) {
        var monthName = monthNames[i].toLowerCase();
        if (monthName.length > 0 && inputLower.indexOf(monthName) > -1) {
          var empty = "";
          for (var j = 0; j < monthName.length; j++) empty += " ";
          this.strToParse = this.strToParse.replace(
            new RegExp(monthName, "gi"),
            empty
          );
          return 1 + parseInt(i);
        }
      }
      return false;
    },
    ParseDay: function (length) {
      if (length < 3) {
        var value = this.popParseNumber();
        if (value < 1 || value > 31) return false;
        this.date.setDate(value);
      }
      return true;
    },
    ParseMonth: function (length) {
      var value;
      switch (length) {
        case 1:
        case 2:
          value = this.popParseNumber();
          break;
        case 3:
          value = this.findAbbrMonth();
          break;
        default:
          value = this.findFullMonth();
          break;
      }
      if (value < 1 || value > 12) return false;
      this.parsedMonth = value - 1;
      return true;
    },
    ParseYear: function (length) {
      var value = this.popParseNumber();
      if (value > 9999) return false;
      if (value < 100) value = ASPx.DateUtils.ExpandTwoDigitYear(value);
      this.date.setFullYear(value);
      this.isYearParsed = true;
      return true;
    },
    ParseHours: function (length) {
      var value = this.popParseNumber();
      if (value > 23) return false;
      this.date.setHours(value);
      return true;
    },
    ParseMinutes: function (length) {
      var value = this.parseMinSecCore();
      if (value == -1) return false;
      this.date.setMinutes(value);
      return true;
    },
    ParseSeconds: function (length) {
      var value = this.parseMinSecCore();
      if (value == -1) return false;
      this.date.setSeconds(value);
      return true;
    },
    ParseMs: function (length) {
      if (length > 3) length = 3;
      var thr = 1;
      for (var i = 0; i < length; i++) thr *= 10;
      thr -= 1;
      var value = this.popParseNumber();
      while (value > thr) value /= 10;
      this.date.setMilliseconds(Math.round(value));
      return true;
    },
    ParseEra: function (length) {
      return true;
    },
    ParseAmPm: function (length) {
      this.hasAmPm =
        ASPx.CultureInfo.am.length > 0 && ASPx.CultureInfo.pm.length > 0;
      return true;
    },
    parseDecInt: function (str) {
      return parseInt(str, 10);
    },
    padLeft: function (str, length) {
      while (str.length < length) str = "0" + str;
      return str;
    },
    formatMs: function (length, trim) {
      var value = Math.floor(
        this.date.getMilliseconds() * Math.pow(10, length - 3)
      );
      value = this.padLeft(value.toString(), length);
      if (trim) {
        var pos = value.length - 1;
        var req = false;
        while (value.charAt(pos) == "0") {
          req = true;
          pos--;
        }
        if (req) value = value.substring(0, pos + 1);
      }
      return value;
    },
    parseMinSecCore: function () {
      var value = this.popParseNumber();
      return value > 59 ? -1 : value;
    },
    fixHours: function () {
      var state = this.getAmPmState(this.strToParse);
      if (!state) return true;
      var h = this.date.getHours();
      switch (state) {
        case "P":
          if (h > 12) return false;
          if (h < 12) this.date.setHours(12 + h);
          break;
        case "A":
          if (h == 12) this.date.setHours(0);
      }
      return true;
    },
    getAmPmState: function (str, skipCorrection) {
      var am = ASPx.CultureInfo.am.charAt(0).toLowerCase();
      var pm = ASPx.CultureInfo.pm.charAt(0).toLowerCase();
      var amMatches = new RegExp(am, "gi").exec(str);
      var pmMatches = new RegExp(pm, "gi").exec(str);
      var amCount = amMatches ? amMatches.length : 0;
      var pmCount = pmMatches ? pmMatches.length : 0;
      var hasAm = amCount > 0;
      var hasPm = pmCount > 0;
      if (hasAm ^ hasPm && amCount < 2 && pmCount < 2) return hasAm ? "A" : "P";
      if (!skipCorrection) {
        str = str.replace(
          new RegExp(this.getDayMonthNameReplacePattern(), "gi"),
          ""
        );
        return this.getAmPmState(str, true);
      }
      return null;
    },
    getDayMonthNameReplacePattern: function () {
      if (!this.dayMonthNameReplacePattern)
        return this.createDayMonthNameReplacePattern();
      return this.dayMonthNameReplacePattern;
    },
    createDayMonthNameReplacePattern: function () {
      var parts = [];
      parts.push("(?:");
      parts.push(this.createReplacePattern(ASPx.CultureInfo.monthNames));
      parts.push(this.createReplacePattern(ASPx.CultureInfo.genMonthNames));
      parts.push(this.createReplacePattern(ASPx.CultureInfo.abbrMonthNames));
      parts.push(this.createReplacePattern(ASPx.CultureInfo.abbrDayNames));
      parts.push(this.createReplacePattern(ASPx.CultureInfo.dayNames));
      parts.push(")");
      return parts.join("");
    },
    createReplacePattern: function (names) {
      return names && names.length > 0
        ? "\\b" + names.join("\\b|\\b") + "\\b"
        : "";
    },
    IsNumericSpecifier: function (sp) {
      var ch = sp.charAt(0);
      if (ch == "g" || ch == "t" || ((ch == "M" || ch == "d") && sp.length > 2))
        return false;
      return true;
    },
    IsKnownSpecifier: function (sp) {
      if (sp.length > 1) sp = sp.charAt(0);
      for (var i = 0; i < this.knownSpecifiers.length; i++) {
        if (this.knownSpecifiers[i] == sp) return true;
      }
      return false;
    },
  });
  DateFormatter.Create = function (format) {
    var instance = new DateFormatter();
    instance.SetFormatString(format);
    return instance;
  };
  DateFormatter.ExpandPredefinedFormat = function (format) {
    switch (format) {
      case "d":
        return ASPx.CultureInfo.shortDate;
      case "D":
        return ASPx.CultureInfo.longDate;
      case "t":
        return ASPx.CultureInfo.shortTime;
      case "T":
        return ASPx.CultureInfo.longTime;
      case "g":
        return ASPx.CultureInfo.shortDate + " " + ASPx.CultureInfo.shortTime;
      case "f":
        return ASPx.CultureInfo.longDate + " " + ASPx.CultureInfo.shortTime;
      case "G":
        return ASPx.CultureInfo.shortDate + " " + ASPx.CultureInfo.longTime;
      case "F":
      case "U":
        return ASPx.CultureInfo.longDate + " " + ASPx.CultureInfo.longTime;
      case "M":
      case "m":
        return ASPx.CultureInfo.monthDay;
      case "Y":
      case "y":
        return ASPx.CultureInfo.yearMonth;
      case "O":
      case "o":
        return "yyyy'-'MM'-'dd'T'HH':'mm':'ss.fffffff";
      case "R":
      case "r":
        return "ddd, dd MMM yyyy HH':'mm':'ss 'GMT'";
      case "s":
        return "yyyy'-'MM'-'dd'T'HH':'mm':'ss";
      case "u":
        return "yyyy'-'MM'-'dd HH':'mm':'ss'Z'";
    }
    return format;
  };
  ASPx.DateFormatter = DateFormatter;
})();
(function () {
  ASPx.Formatter = {
    Format: function () {
      if (arguments.length < 1) return "";
      var format = arguments[0];
      if (format == null) return "";
      var args;
      if (
        arguments.length > 1 &&
        arguments[1] != null &&
        arguments[1].constructor == Array
      ) {
        args = arguments[1];
      } else {
        args = [];
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
      }
      var bag = [];
      var pos = 0;
      var savedPos = 0;
      while (pos < format.length) {
        var ch = format.charAt(pos);
        pos++;
        if (ch == "{") {
          bag.push(format.substr(savedPos, pos - savedPos - 1));
          if (format.charAt(pos) == "{") {
            savedPos = pos;
            pos++;
            continue;
          }
          var spec = this.ParseSpec(format, pos);
          var pos = spec.pos;
          var arg = args[spec.index];
          var argString;
          if (arg == null) {
            argString = "";
          } else if (typeof arg == "number") {
            argString = ASPx.NumberFormatter.Format(spec.format, arg);
          } else if (arg.constructor == Date) {
            if (spec.format != this.activeDateFormat) {
              this.activeDateFormat = spec.format;
              if (spec.format == "") spec.format = "G";
              if (spec.format.length == 1)
                spec.format = ASPx.DateFormatter.ExpandPredefinedFormat(
                  spec.format
                );
              this.GetDateFormatter().SetFormatString(spec.format);
            }
            if (this.activeDateFormat == "U")
              arg = ASPx.DateUtils.ToUtcTime(arg);
            argString = this.GetDateFormatter().Format(arg);
          } else {
            argString = String(arg);
            if (spec.format != "" && argString.length > 0) {
              var num = Number(argString.replace(",", "."));
              if (!isNaN(num))
                argString = ASPx.NumberFormatter.Format(spec.format, num);
            }
          }
          var padLen = spec.width - argString.length;
          if (padLen > 0) {
            if (spec.left) bag.push(argString);
            for (var i = 0; i < padLen; i++) bag.push(" ");
            if (!spec.left) bag.push(argString);
          } else {
            bag.push(argString);
          }
          savedPos = pos;
        } else if (
          ch == "}" &&
          pos < format.length &&
          format.charAt(pos) == "}"
        ) {
          bag.push(format.substr(savedPos, pos - savedPos - 1));
          savedPos = pos;
          pos++;
        } else if (ch == "}") {
          return "";
        }
      }
      if (savedPos < format.length) bag.push(format.substr(savedPos));
      return bag.join("");
    },
    ParseSpec: function (format, pos) {
      var result = {
        index: -1,
        left: false,
        width: 0,
        format: "",
        pos: 0,
      };
      var savedPos, ch;
      savedPos = pos;
      while (true) {
        ch = format.charAt(pos);
        if (ch < "0" || ch > "9") break;
        pos++;
      }
      if (pos > savedPos)
        result.index = Number(format.substr(savedPos, pos - savedPos));
      if (format.charAt(pos) == ",") {
        pos++;
        while (true) {
          ch = format.charAt(pos);
          if (ch != " " && ch != "\t") break;
          pos++;
        }
        result.left = format.charAt(pos) == "-";
        if (result.left) pos++;
        savedPos = pos;
        while (true) {
          ch = format.charAt(pos);
          if (ch < "0" || ch > "9") break;
          pos++;
        }
        if (pos > savedPos)
          result.width = Number(format.substr(savedPos, pos - savedPos));
      }
      if (format.charAt(pos) == ":") {
        pos++;
        savedPos = pos;
        while (format.charAt(pos) != "}") pos++;
        result.format = format.substr(savedPos, pos - savedPos);
      }
      pos++;
      result.pos = pos;
      return result;
    },
    activeDateFormat: null,
    GetDateFormatter: function () {
      if (!this.__dateFormatter)
        this.__dateFormatter = new ASPx.DateFormatter();
      return this.__dateFormatter;
    },
  };
  ASPx.NumberFormatter = {
    Format: function (format, value) {
      if (isNaN(value)) return ASPx.CultureInfo.numNan;
      if (!isFinite(value)) {
        return value > 0
          ? ASPx.CultureInfo.numPosInf
          : ASPx.CultureInfo.numNegInf;
      }
      this.FillFormatInfo(format);
      if (this.spec == "X") return this.FormatHex(value);
      this.FillDigitInfo(value);
      switch (this.spec) {
        case "C":
          return this.FormatCurrency();
        case "D":
          return this.FormatDecimal();
        case "E":
          return this.FormatExp();
        case "F":
          return this.FormatFixed();
        case "G":
          return this.FormatGeneral();
        case "N":
          return this.FormatNumber();
        case "P":
          return this.FormatPercent();
        default:
          if (this.custom) return this.FormatCustom(format);
          return "?";
      }
    },
    positive: true,
    digits: null,
    pointPos: 0,
    spec: "",
    prec: -1,
    upper: true,
    custom: false,
    FormatCurrency: function () {
      if (this.prec < 0) this.prec = ASPx.CultureInfo.currPrec;
      this.Round(this.prec);
      var bag = [];
      if (this.positive) {
        switch (ASPx.CultureInfo.currPosPattern) {
          case 0:
            bag.push(ASPx.CultureInfo.currency);
            break;
          case 2:
            bag.push(ASPx.CultureInfo.currency, " ");
            break;
        }
      } else {
        switch (ASPx.CultureInfo.currNegPattern) {
          case 0:
            bag.push("(", ASPx.CultureInfo.currency);
            break;
          case 1:
            bag.push("-", ASPx.CultureInfo.currency);
            break;
          case 2:
            bag.push(ASPx.CultureInfo.currency, "-");
            break;
          case 3:
            bag.push(ASPx.CultureInfo.currency);
            break;
          case 4:
            bag.push("(");
            break;
          case 5:
          case 8:
            bag.push("-");
            break;
          case 9:
            bag.push("-", ASPx.CultureInfo.currency, " ");
            break;
          case 11:
            bag.push(ASPx.CultureInfo.currency, " ");
            break;
          case 12:
            bag.push(ASPx.CultureInfo.currency, " -");
            break;
          case 14:
            bag.push("(", ASPx.CultureInfo.currency, " ");
            break;
          case 15:
            bag.push("(");
            break;
        }
      }
      this.AppendGroupedInteger(
        bag,
        ASPx.CultureInfo.currGroups,
        ASPx.CultureInfo.currGroupSeparator
      );
      if (this.prec > 0) {
        bag.push(ASPx.CultureInfo.currDecimalPoint);
        this.AppendDigits(bag, this.pointPos, this.pointPos + this.prec);
      }
      if (this.positive) {
        switch (ASPx.CultureInfo.currPosPattern) {
          case 1:
            bag.push(ASPx.CultureInfo.currency);
            break;
          case 3:
            bag.push(" ", ASPx.CultureInfo.currency);
            break;
        }
      } else {
        switch (ASPx.CultureInfo.currNegPattern) {
          case 0:
          case 14:
            bag.push(")");
            break;
          case 3:
            bag.push("-");
            break;
          case 4:
            bag.push(ASPx.CultureInfo.currency, ")");
            break;
          case 5:
            bag.push(ASPx.CultureInfo.currency);
            break;
          case 6:
            bag.push("-", ASPx.CultureInfo.currency);
            break;
          case 7:
            bag.push(ASPx.CultureInfo.currency, "-");
            break;
          case 8:
            bag.push(" ", ASPx.CultureInfo.currency);
            break;
          case 10:
            bag.push(" ", ASPx.CultureInfo.currency, "-");
            break;
          case 11:
            bag.push("-");
            break;
          case 13:
            bag.push("- ", ASPx.CultureInfo.currency);
            break;
          case 15:
            bag.push(" ", ASPx.CultureInfo.currency, ")");
            break;
        }
      }
      return bag.join("");
    },
    FormatDecimal: function () {
      if (this.prec < this.pointPos) this.prec = this.pointPos;
      if (this.prec < 1) return "0";
      var bag = [];
      if (!this.positive) bag.push("-");
      this.AppendDigits(bag, this.pointPos - this.prec, this.pointPos);
      return bag.join("");
    },
    FormatExp: function () {
      if (this.prec < 0) this.prec = 6;
      this.Round(1 - this.pointPos + this.prec);
      return this.FormatExpCore(3);
    },
    FormatExpCore: function (minExpDigits) {
      var bag = [];
      if (!this.positive) bag.push("-");
      this.AppendDigits(bag, 0, 1);
      if (this.prec > 0) {
        bag.push(ASPx.CultureInfo.numDecimalPoint);
        this.AppendDigits(bag, 1, 1 + this.prec);
      }
      bag.push(this.upper ? "E" : "e");
      var order = this.pointPos - 1;
      if (order >= 0) {
        bag.push("+");
      } else {
        bag.push("-");
        order = -order;
      }
      var orderStr = String(order);
      for (var i = orderStr.length; i < minExpDigits; i++) bag.push(0);
      bag.push(orderStr);
      return bag.join("");
    },
    FormatFixed: function () {
      if (this.prec < 0) this.prec = ASPx.CultureInfo.numPrec;
      this.Round(this.prec);
      var bag = [];
      if (!this.positive) bag.push("-");
      if (this.pointPos < 1) bag.push(0);
      else this.AppendDigits(bag, 0, this.pointPos);
      if (this.prec > 0) {
        bag.push(ASPx.CultureInfo.numDecimalPoint);
        this.AppendDigits(bag, this.pointPos, this.pointPos + this.prec);
      }
      return bag.join("");
    },
    FormatGeneral: function () {
      var hasFrac = this.pointPos < this.digits.length;
      var allowExp;
      if (this.prec < 0) {
        allowExp = hasFrac;
        this.prec = hasFrac ? 15 : 10;
      } else {
        allowExp = true;
        if (this.prec < 1) this.prec = hasFrac ? 15 : 10;
        this.Round(this.prec - this.pointPos);
      }
      if (allowExp) {
        if (this.pointPos > this.prec || this.pointPos <= -4) {
          this.prec = this.digits.length - 1;
          return this.FormatExpCore(2);
        }
      }
      this.prec =
        Math.min(this.prec, Math.max(1, this.digits.length)) - this.pointPos;
      return this.FormatFixed();
    },
    FormatNumber: function () {
      if (this.prec < 0) this.prec = ASPx.CultureInfo.numPrec;
      this.Round(this.prec);
      var bag = [];
      if (!this.positive) {
        switch (ASPx.CultureInfo.numNegPattern) {
          case 0:
            bag.push("(");
            break;
          case 1:
            bag.push("-");
            break;
          case 2:
            bag.push("- ");
            break;
        }
      }
      this.AppendGroupedInteger(
        bag,
        ASPx.CultureInfo.numGroups,
        ASPx.CultureInfo.numGroupSeparator
      );
      if (this.prec > 0) {
        bag.push(ASPx.CultureInfo.numDecimalPoint);
        this.AppendDigits(bag, this.pointPos, this.pointPos + this.prec);
      }
      if (!this.positive) {
        switch (ASPx.CultureInfo.numNegPattern) {
          case 0:
            bag.push(")");
            break;
          case 3:
            bag.push("-");
            break;
          case 4:
            bag.push(" -");
            break;
        }
      }
      return bag.join("");
    },
    FormatPercent: function () {
      if (this.prec < 0) this.prec = ASPx.CultureInfo.numPrec;
      if (this.digits.length > 0) this.pointPos += 2;
      this.Round(this.prec);
      var bag = [];
      if (!this.positive) bag.push("-");
      if (ASPx.CultureInfo.percentPattern == 2) bag.push("%");
      this.AppendGroupedInteger(
        bag,
        ASPx.CultureInfo.numGroups,
        ASPx.CultureInfo.numGroupSeparator
      );
      if (this.prec > 0) {
        bag.push(ASPx.CultureInfo.numDecimalPoint);
        this.AppendDigits(bag, this.pointPos, this.pointPos + this.prec);
      }
      switch (ASPx.CultureInfo.percentPattern) {
        case 0:
          bag.push(" %");
          break;
        case 1:
          bag.push("%");
          break;
      }
      return bag.join("");
    },
    FormatHex: function (value) {
      var result = value.toString(16);
      if (result.indexOf("(") > -1) return result;
      result = this.upper ? result.toUpperCase() : result.toLowerCase();
      if (this.prec <= result.length) return result;
      var bag = [];
      for (var i = result.length; i < this.prec; i++) bag.push(0);
      bag.push(result);
      return bag.join("");
    },
    FormatCustom: function (format) {
      var sectionList = this.GetCustomFormatSections(format);
      var section = this.SelectCustomFormatSection(sectionList);
      if (section == "") return this.positive ? "" : "-";
      var info = this.ParseCustomFormatSection(section);
      var lists = this.CreateCustomFormatLists(info);
      if (sectionList.length > 2 && section != sectionList[2]) {
        var zero = lists.i.concat(lists.f).join("").split(0).join("") == "";
        if (zero) {
          section = sectionList[2];
          info = this.ParseCustomFormatSection(section);
          lists = this.CreateCustomFormatLists(info);
        }
      }
      return this.FormatCustomCore(section, info, lists);
    },
    GetCustomFormatSections: function (format) {
      var sections = [];
      var escaping = false;
      var quote = "";
      var length = 0;
      var prevPos = 0;
      for (var i = 0; i < format.length; i++) {
        var ch = format.charAt(i);
        if (!escaping && quote == "" && ch == ";") {
          sections.push(format.substr(prevPos, length));
          length = 0;
          prevPos = i + 1;
          if (sections.length > 2) break;
        } else {
          if (escaping) escaping = false;
          else if (ch == quote) quote = quote == "" ? ch : "";
          else if (ch == "\\") escaping = true;
          else if (ch == "'" || ch == '"') quote = ch;
          ++length;
        }
      }
      if (length > 0) sections.push(format.substr(prevPos, length));
      if (sections.length < 1) sections.push(format);
      return sections;
    },
    SelectCustomFormatSection: function (sections) {
      if (!this.positive && sections.length > 1 && sections[1] != "") {
        this.positive = true;
        return sections[1];
      }
      if (this.digits.length < 1 && sections.length > 2 && sections[2] != "")
        return sections[2];
      return sections[0];
    },
    CreateCustomFormatInfo: function () {
      return {
        pointPos: -1,
        grouping: false,
        exp: false,
        expShowPlus: false,
        percent: false,
        scaling: 0,
        intDigits: 0,
        fracDigits: 0,
        expDigits: 0,
        intSharps: 0,
        fracSharps: 0,
        expSharps: 0,
      };
    },
    ParseCustomFormatSection: function (section) {
      var quote = "";
      var area = "i";
      var canParseIntSharps = true;
      var result = this.CreateCustomFormatInfo();
      var groupSeparators = 0;
      for (var i = 0; i < section.length; i++) {
        var ch = section.charAt(i);
        if (ch == quote) {
          quote = "";
          continue;
        }
        if (quote != "") continue;
        if (area == "e" && ch != "0" && ch != "#") {
          area = result.pointPos < 0 ? "i" : "f";
          i--;
          continue;
        }
        switch (ch) {
          case "\\":
            i++;
            continue;
          case "'":
          case '"':
            quote = ch;
            continue;
          case "#":
          case "0":
            if (ch == "#") {
              switch (area) {
                case "i":
                  if (canParseIntSharps) result.intSharps++;
                  break;
                case "f":
                  result.fracSharps++;
                  break;
                case "e":
                  result.expSharps++;
                  break;
              }
            } else {
              canParseIntSharps = false;
              switch (area) {
                case "f":
                  result.fracSharps = 0;
                  break;
                case "e":
                  result.expSharps = 0;
                  break;
              }
            }
            switch (area) {
              case "i":
                result.intDigits++;
                if (groupSeparators > 0) result.grouping = true;
                groupSeparators = 0;
                break;
              case "f":
                result.fracDigits++;
                break;
              case "e":
                result.expDigits++;
                break;
            }
            break;
          case "e":
          case "E":
            if (result.exp) break;
            result.exp = true;
            area = "e";
            if (i < section.length - 1) {
              var next = section.charAt(1 + i);
              if (next == "+" || next == "-") {
                if (next == "+") result.expShowPlus = true;
                i++;
              } else if (next != "0" && next != "#") {
                result.exp = false;
                if (result.pointPos < 0) area = "i";
              }
            }
            break;
          case ".":
            area = "f";
            if (result.pointPos < 0) result.pointPos = i;
            break;
          case "%":
            result.percent = true;
            break;
          case ",":
            if (area == "i" && result.intDigits > 0) groupSeparators++;
            break;
          default:
            break;
        }
      }
      if (result.expDigits < 1) result.exp = false;
      else result.intSharps = 0;
      if (result.fracDigits < 1) result.pointPos = -1;
      result.scaling = 3 * groupSeparators;
      return result;
    },
    CreateCustomFormatLists: function (info) {
      var intList = [];
      var fracList = [];
      var expList = [];
      if (this.digits.length > 0) {
        if (info.percent) this.pointPos += 2;
        this.pointPos -= info.scaling;
      }
      var expPositive = true;
      if (info.exp && (info.intDigits > 0 || info.fracDigits > 0)) {
        var diff = 0;
        if (this.digits.length > 0) {
          this.Round(info.intDigits + info.fracDigits - this.pointPos);
          diff -= this.pointPos - info.intDigits;
          this.pointPos = info.intDigits;
        }
        expPositive = diff <= 0;
        expList = String(diff < 0 ? -diff : diff).split("");
      } else {
        this.Round(info.fracDigits);
      }
      if (this.digits.length < 1 || this.pointPos < 1) intList = [0];
      else this.AppendDigits(intList, 0, this.pointPos);
      this.AppendDigits(fracList, this.pointPos, this.digits.length);
      if (info.exp) {
        while (intList.length < info.intDigits) intList.unshift(0);
        while (expList.length < info.expDigits - info.expSharps)
          expList.unshift(0);
        if (expPositive && info.expShowPlus) expList.unshift("+");
        else if (!expPositive) expList.unshift("-");
      } else {
        while (intList.length < info.intDigits - info.intSharps)
          intList.unshift(0);
        if (info.intSharps >= info.intDigits) {
          var zero = true;
          for (var i = 0; i < intList.length; i++) {
            if (intList[i] != 0) {
              zero = false;
              break;
            }
          }
          if (zero) intList = [];
        }
      }
      while (fracList.length < info.fracDigits - info.fracSharps)
        fracList.push(0);
      return {
        i: intList,
        f: fracList,
        e: expList,
      };
    },
    FormatCustomCore: function (section, info, lists) {
      var intLen = 0;
      var total = 0;
      var groupIndex = 0;
      var counter = 0;
      var groupSize = 0;
      if (info.grouping && ASPx.CultureInfo.numGroups.length > 0) {
        intLen = lists.i.length;
        for (var i = 0; i < ASPx.CultureInfo.numGroups.length; i++) {
          if (total + ASPx.CultureInfo.numGroups[i] <= intLen) {
            total += ASPx.CultureInfo.numGroups[i];
            groupIndex = i;
          }
        }
        groupSize = ASPx.CultureInfo.numGroups[groupIndex];
        var fraction = intLen > total ? intLen - total : 0;
        if (groupSize == 0) {
          while (groupIndex >= 0 && ASPx.CultureInfo.numGroups[groupIndex] == 0)
            groupIndex--;
          groupSize =
            fraction > 0 ? fraction : ASPx.CultureInfo.numGroups[groupIndex];
        }
        if (fraction == 0) {
          counter = groupSize;
        } else {
          groupIndex += Math.floor(fraction / groupSize);
          counter = fraction % groupSize;
          if (counter == 0) counter = groupSize;
          else groupIndex++;
        }
      } else {
        info.grouping = false;
      }
      var bag = [];
      var area = "i";
      var intSharps = 0;
      var intListIndex = 0;
      var fracListIndex = 0;
      var savedCh = "";
      for (var i = 0; i < section.length; i++) {
        var ch = section.charAt(i);
        if (ch == savedCh) {
          savedCh = "";
          continue;
        }
        if (savedCh != "") {
          bag.push(ch);
          continue;
        }
        switch (ch) {
          case "\\":
            ++i;
            if (i < section.length) bag.push(section.charAt(i));
            continue;
          case "'":
          case '"':
            savedCh = ch;
            continue;
          case "#":
          case "0":
            if (area == "i") {
              intSharps++;
              if (
                ch == "0" ||
                info.intDigits - intSharps < lists.i.length + intListIndex
              ) {
                while (
                  info.intDigits - intSharps + intListIndex <
                  lists.i.length
                ) {
                  bag.push(lists.i[intListIndex]);
                  intListIndex++;
                  if (info.grouping && --intLen > 0 && --counter == 0) {
                    bag.push(ASPx.CultureInfo.numGroupSeparator);
                    if (
                      --groupIndex < ASPx.CultureInfo.numGroups.length &&
                      groupIndex >= 0
                    )
                      groupSize = ASPx.CultureInfo.numGroups[groupIndex];
                    counter = groupSize;
                  }
                }
              }
            } else if (area == "f") {
              if (fracListIndex < lists.f.length) {
                bag.push(lists.f[fracListIndex]);
                fracListIndex++;
              }
            }
            break;
          case "e":
          case "E":
            if (lists.e == null || !info.exp) {
              bag.push(ch);
              break;
            }
            for (var q = i + 1; q < section.length; q++) {
              if (
                q == i + 1 &&
                (section.charAt(q) == "+" || section.charAt(q) == "-")
              )
                continue;
              if (section.charAt(q) == "0" || section.charAt(q) == "#")
                continue;
              break;
            }
            i = q - 1;
            area = info.pointPos < 0 ? "i" : "f";
            bag.push(ch);
            bag = bag.concat(lists.e);
            lists.e = null;
            break;
          case ".":
            if (info.pointPos == i && lists.f.length > 0)
              bag.push(ASPx.CultureInfo.numDecimalPoint);
            area = "f";
            break;
          case ",":
            break;
          default:
            bag.push(ch);
            break;
        }
      }
      if (!this.positive) bag.unshift("-");
      return bag.join("");
    },
    FillDigitInfo: function (value) {
      this.positive = true;
      if (value < 0) {
        value = -value;
        this.positive = false;
      }
      this.digits = [];
      this.pointPos = 0;
      if (value == 0 || !isFinite(value) || isNaN(value)) {
        this.pointPos = 1;
        return;
      }
      var list = String(value).split("e");
      var str = list[0];
      if (list.length > 1) {
        this.pointPos = Number(list[1]);
      }
      var frac = false;
      var decimalCount = 0;
      for (var i = 0; i < str.length; i++) {
        var ch = str.charAt(i);
        if (ch == ".") {
          frac = true;
        } else {
          if (frac) decimalCount++;
          if (ch != "0" || this.digits.length > 0) this.digits.push(Number(ch));
        }
      }
      this.pointPos += this.digits.length - decimalCount;
    },
    FillFormatInfo: function (format) {
      this.upper = true;
      this.custom = false;
      this.prec = -1;
      var spec;
      if (format == null || format.length < 1) spec = "G";
      else spec = format.charAt(0);
      if (spec >= "a" && spec <= "z") {
        spec = spec.toUpperCase();
        this.upper = false;
      }
      if (spec >= "A" && spec <= "Z") {
        if (format != null && format.length > 1) {
          var prec = Number(format.substr(1));
          if (!isNaN(prec)) this.prec = prec;
          else this.custom = true;
        }
      } else {
        this.custom = true;
      }
      this.spec = this.custom ? "0" : spec;
    },
    Round: function (shift) {
      var amount = this.digits.length - this.pointPos - shift;
      if (amount <= 0) return;
      var cutPos = this.pointPos + shift;
      if (cutPos < 0) {
        this.digits = [];
        this.pointPos = 0;
        return;
      }
      var digit = this.digits[cutPos];
      if (digit > 4) {
        for (var i = 0; i < amount; i++) {
          var index = cutPos - 1 - i;
          if (index < 0) {
            this.digits.unshift(0);
            this.pointPos++;
            cutPos++;
            index++;
          }
          digit = this.digits[index];
          if (digit < 9) {
            this.digits[index] = 1 + digit;
            break;
          } else {
            this.digits[index] = 0;
            amount++;
          }
        }
      }
      for (var i = cutPos - 1; i >= 0; i--) {
        if (this.digits[i] > 0) break;
        cutPos--;
      }
      this.digits.splice(cutPos, this.digits.length - cutPos);
    },
    AppendGroupedInteger: function (list, groups, separator) {
      if (this.pointPos < 1) {
        list.push(0);
        return;
      }
      var total = 0;
      var groupIndex = 0;
      for (var i = 0; i < groups.length; i++) {
        if (total + groups[i] <= this.pointPos) {
          total += groups[i];
          groupIndex = i;
        } else break;
      }
      if (groups.length > 0 && total > 0) {
        var counter;
        var groupSize = groups[groupIndex];
        var fraction = this.pointPos > total ? this.pointPos - total : 0;
        if (groupSize == 0) {
          while (groupIndex >= 0 && groups[groupIndex] == 0) groupIndex--;
          groupSize = fraction > 0 ? fraction : groups[groupIndex];
        }
        if (fraction == 0) {
          counter = groupSize;
        } else {
          groupIndex += Math.floor(fraction / groupSize);
          counter = fraction % groupSize;
          if (counter == 0) counter = groupSize;
          else groupIndex++;
        }
        var i = 0;
        while (true) {
          if (this.pointPos - i <= counter || counter == 0) {
            this.AppendDigits(list, i, this.pointPos);
            break;
          }
          this.AppendDigits(list, i, i + counter);
          list.push(separator);
          i += counter;
          groupIndex--;
          if (groupIndex < groups.length && groupIndex >= 0)
            groupSize = groups[groupIndex];
          counter = groupSize;
        }
      } else {
        this.AppendDigits(list, 0, this.pointPos);
      }
    },
    AppendDigits: function (list, start, end) {
      for (var i = start; i < end; i++) {
        if (i < 0 || i >= this.digits.length) list.push(0);
        else list.push(this.digits[i]);
      }
    },
  };
})();
(function () {
  var ProgressBarIDSuffix = {
    DivIndicator: "_DI",
    ValueIndicatorCell: "_VIC",
  };
  var ASPxClientProgressBarBase = ASPx.CreateClass(ASPxClientControl, {
    constructor: function (name) {
      this.constructor.prototype.constructor.call(this, name);
      this.displayMode = ASPxClientProgressBarBase.DisplayMode.Percentage;
      this.displayFormat = null;
      this.minimum = 0;
      this.maximum = 0;
      this.position = 0;
      this.onePercentValue = 0;
      this.hasOwner = true;
      this.customDisplayFormat = "";
    },
    InlineInitialize: function (calledByOwner) {
      ASPxClientControl.prototype.InlineInitialize.call(this);
      if (calledByOwner || !this.hasOwner) {
        this.OnePercentValueUpdate();
        if (this.IsIndicatorDivWidthCorrectionRequired())
          this.SetCalculatedDivIndicatorWidth();
      }
    },
    OnePercentValueUpdate: function () {
      this.onePercentValue = (this.maximum - this.minimum) / 100;
    },
    GetMainCell: function () {
      if (!this.mainCell)
        this.mainCell = ASPx.GetNodeByTagName(this.GetMainElement(), "TD", 0);
      return this.mainCell;
    },
    GetIndicatorDiv: function () {
      if (!this.divIndicator)
        this.divIndicator = ASPx.GetElementById(
          this.name + ProgressBarIDSuffix.DivIndicator
        );
      return this.divIndicator;
    },
    GetValueIndicatorTable: function () {
      if (!this.valueIndicatorTable)
        this.valueIndicatorTable = ASPx.GetParentByTagName(
          this.GetValueIndicatorCell(),
          "TABLE"
        );
      return this.valueIndicatorTable;
    },
    GetValueIndicatorCell: function () {
      if (!this.valueIndicatorCell)
        this.valueIndicatorCell = ASPx.GetElementById(
          this.name + ProgressBarIDSuffix.ValueIndicatorCell
        );
      return this.valueIndicatorCell;
    },
    AdjustControlCore: function () {
      ASPxClientControl.prototype.AdjustControlCore.call(this);
      this.UpdateIndicators();
      this.CorrectIndicatorHeight();
    },
    CorrectIndicatorHeight: function () {
      var mainCell = this.GetMainCell();
      var valueIndicatorTable = this.GetValueIndicatorTable();
      var indicatorDiv = this.GetIndicatorDiv();
      if (indicatorDiv) indicatorDiv.style.height = "";
      if (valueIndicatorTable) {
        valueIndicatorTable.style.height = "";
        valueIndicatorTable.style.marginTop = "";
      }
      var height = ASPx.GetClearClientHeight(mainCell);
      if (indicatorDiv)
        indicatorDiv.style.height =
          height -
          ASPx.GetTopBottomBordersAndPaddingsSummaryValue(indicatorDiv) +
          "px";
      if (valueIndicatorTable) {
        valueIndicatorTable.style.height =
          height -
          ASPx.GetTopBottomBordersAndPaddingsSummaryValue(valueIndicatorTable) +
          "px";
        valueIndicatorTable.style.marginTop = -height + "px";
      }
      if (ASPx.Browser.IE && ASPx.Browser.MajorVersion == 8) {
        var valueIndicatorCell = this.GetValueIndicatorCell();
        if (valueIndicatorCell)
          valueIndicatorCell.innerHTML = valueIndicatorCell.innerHTML;
      }
    },
    ResetIndicatorHeight: function () {
      ASPx.SetOffsetHeight(this.GetIndicatorDiv(), 1);
      var valueIndicatorTable = this.GetValueIndicatorTable();
      if (valueIndicatorTable) ASPx.SetOffsetHeight(valueIndicatorTable, 1);
    },
    GetCalculatedIndicatorDivWidth: function (percent) {
      var progressWidth = ASPx.GetClearClientWidth(this.GetMainCell());
      var indicatorDivStyle = ASPx.GetCurrentStyle(this.GetIndicatorDiv());
      progressWidth -=
        ASPx.PxToInt(indicatorDivStyle.borderLeftWidth) +
        ASPx.PxToInt(indicatorDivStyle.borderRightWidth);
      return (progressWidth / 100) * percent;
    },
    UpdateIndicators: function () {
      if (this.IsIndicatorDivWidthCorrectionRequired()) {
        this.SetCalculatedDivIndicatorWidth();
      } else {
        var percent = this.GetPercent();
        this.GetIndicatorDiv().style.width = percent < 0 ? 0 : percent + "%";
      }
      var cell = this.GetValueIndicatorCell();
      if (cell) {
        cell.innerHTML = this.GetIndicatorText();
      }
    },
    GetIndicatorText: function () {
      if (this.displayMode == ASPxClientProgressBarBase.DisplayMode.Custom)
        return this.GetCustomText();
      var indicatorValue =
        this.displayMode == ASPxClientProgressBarBase.DisplayMode.Position
          ? this.position
          : this.GetPercent();
      if (this.displayFormat != null)
        indicatorValue = ASPx.Formatter.Format(
          this.displayFormat,
          indicatorValue
        );
      if (this.displayMode == ASPxClientProgressBarBase.DisplayMode.Position)
        return indicatorValue;
      if (this.rtl && ASPx.CultureInfo.percentPattern == 0)
        return indicatorValue + " %";
      return indicatorValue + "%";
    },
    SetCalculatedDivIndicatorWidth: function () {
      var indicatorWidth = this.GetCalculatedIndicatorDivWidth(
        this.GetPercent()
      );
      if (indicatorWidth >= 0)
        this.GetIndicatorDiv().style.width = indicatorWidth + "px";
    },
    IsIndicatorDivWidthCorrectionRequired: function () {
      if (!ASPx.IsExistsElement(this.GetIndicatorDiv())) return false;
      var indicatorDivStyle = ASPx.GetCurrentStyle(this.GetIndicatorDiv());
      return (
        ASPx.PxToInt(indicatorDivStyle.borderLeftWidth) > 0 ||
        ASPx.PxToInt(indicatorDivStyle.borderRightWidth) > 0
      );
    },
    SetCustomDisplayFormat: function (value) {
      this.customDisplayFormat = value;
      this.UpdateIndicators();
    },
    GetDisplayText: function () {
      return this.GetIndicatorText();
    },
    GetCustomText: function () {
      if (this.displayFormat != null) {
        return this.customDisplayFormat
          .replace(
            "{0}",
            ASPx.Formatter.Format(this.displayFormat, this.position)
          )
          .replace(
            "{1}",
            ASPx.Formatter.Format(this.displayFormat, this.minimum)
          )
          .replace(
            "{2}",
            ASPx.Formatter.Format(this.displayFormat, this.maximum)
          );
      } else {
        return this.customDisplayFormat
          .replace("{0}", this.position)
          .replace("{1}", this.minimum)
          .replace("{2}", this.maximum);
      }
    },
    SetPosition: function (value) {
      this.position = Math.min(Math.max(value, this.minimum), this.maximum);
      this.UpdateIndicators();
    },
    SetMinMaxValues: function (minValue, maxValue) {
      var preparedMinValue = parseInt(minValue.toString(), 10);
      var preparedMaxValue = parseInt(maxValue.toString(), 10);
      if (isNaN(preparedMinValue)) preparedMinValue = this.minimum;
      if (isNaN(preparedMaxValue)) preparedMaxValue = this.maximum;
      if (preparedMaxValue > preparedMinValue) {
        this.maximum = preparedMaxValue;
        this.minimum = preparedMinValue;
        this.OnePercentValueUpdate();
        this.SetPosition(this.position);
      }
    },
    GetPosition: function () {
      return this.position;
    },
    GetPercent: function () {
      if (this.minimum === this.maximum) return 0;
      return (this.position - this.minimum) / this.onePercentValue;
    },
  });
  ASPxClientProgressBarBase.DisplayMode = {
    Percentage: 0,
    Position: 1,
    Custom: 2,
  };
  window.ASPxClientProgressBarBase = ASPxClientProgressBarBase;
})();
