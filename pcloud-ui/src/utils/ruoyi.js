const baseURL = process.env.VUE_APP_BASE_API

// 日期格式化
export function parseTime(time, pattern) {
	if (arguments.length === 0) {
		return null
	}
	if(!time){
		return null;
	}
	const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
	let date
	if (typeof time === 'object') {
		date = time
	} else {
		if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
			time = parseInt(time)
		}
		if ((typeof time === 'number') && (time.toString().length === 10)) {
			time = time * 1000
		}
		date = new Date(time)
	}
	const formatObj = {
		y: date.getFullYear(),
		m: date.getMonth() + 1,
		d: date.getDate(),
		h: date.getHours(),
		i: date.getMinutes(),
		s: date.getSeconds(),
		a: date.getDay()
	}
	const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
		let value = formatObj[key]
		// Note: getDay() returns 0 on Sunday
		if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
		if (result.length > 0 && value < 10) {
			value = '0' + value
		}
		return value || 0
	})
	return time_str
}
export function dateDiffMonth(beginDate,endDate){
	if (arguments.length !== 2) {
		return null
	}
	if(!beginDate || !endDate){
		return null;
	}
	let tempBeginDate
	if (typeof beginDate === 'object') {
		tempBeginDate = beginDate
	} else {
		if ((typeof beginDate === 'string') && (/^[0-9]+$/.test(beginDate))) {
			beginDate = parseInt(beginDate)
		}
		if ((typeof beginDate === 'number') && (beginDate.toString().length === 10)) {
			beginDate = beginDate * 1000
		}
		tempBeginDate = new Date(beginDate)
	}
	let tempEndDate
	if (typeof endDate === 'object') {
		tempEndDate = endDate
	} else {
		if ((typeof endDate === 'string') && (/^[0-9]+$/.test(endDate))) {
			endDate = parseInt(endDate)
		}
		if ((typeof endDate === 'number') && (endDate.toString().length === 10)) {
			endDate = endDate * 1000
		}
		tempEndDate = new Date(endDate)
	}
	const formatObj1 = {
		y: tempBeginDate.getFullYear(),
		m: tempBeginDate.getMonth() + 1
	}

	const formatObj2 = {
		y: tempEndDate.getFullYear(),
		m: tempEndDate.getMonth() + 1
	}

	return (formatObj2.y - formatObj1.y) * 12 +(formatObj2.m - formatObj1.m)
}
// 日期添加月份
export function dateAddMonth(time,amount){
	if (arguments.length !== 2) {
		return null
	}
	if(!time || (typeof amount !== 'number')){
		return null;
	}
	const format = '{y}-{m}';
	let date
	if (typeof time === 'object') {
		date = time
	} else {
		if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
			time = parseInt(time)
		}
		if ((typeof time === 'number') && (time.toString().length === 10)) {
			time = time * 1000
		}
		date = new Date(time)
	}
	const formatObj = {
		y: date.getFullYear(),
		m: date.getMonth() + 1 + amount
	}
	const addYear = parseInt((formatObj.m-1) / 12);
	formatObj.y = formatObj.y + addYear;
	formatObj.m = formatObj.m - addYear*12;
	console.log(formatObj)
	const time_str = format.replace(/{(y|m)+}/g, (result, key) => {
		let value = formatObj[key]
		if (result.length > 0 && value < 10) {
			value = '0' + value
		}
		return value || 0
	})
	return time_str


}
// 日期格式化
export function parseDate(time, pattern) {
	if (arguments.length === 0) {
		return null
	}
	if(!time){
		return null;
	}
	const format = pattern || '{y}-{m}-{d}'
	let date
	if (typeof time === 'object') {
		date = time
	} else {
		if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
			time = parseInt(time)
		}
		if ((typeof time === 'number') && (time.toString().length === 10)) {
			time = time * 1000
		}
		date = new Date(time)
	}
	const formatObj = {
		y: date.getFullYear(),
		m: date.getMonth() + 1,
		d: date.getDate(),
		a: date.getDay()
	}
	const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
		let value = formatObj[key]
		// Note: getDay() returns 0 on Sunday
		if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
		if (result.length > 0 && value < 10) {
			value = '0' + value
		}
		return value || 0
	})
	return time_str
}

// 表单重置
export function resetForm(refName) {
	if (this.$refs[refName]) {
		this.$refs[refName].resetFields();
	}
}

// 添加日期范围
export function addDateRange(params, dateRange) {
	var search = params;
	search.beginTime = "";
	search.endTime = "";
	if (null != dateRange && '' != dateRange) {
		search.beginTime = this.dateRange[0];
		search.endTime = this.dateRange[1];
	}
	return search;
}

// 回显数据字典
export function selectDictLabel(datas, value) {
	var actions = [];
	Object.keys(datas).map((key) => {
		if (datas[key].dictValue == ('' + value)) {
			actions.push(datas[key].dictLabel);
			return false;
		}
	})
	return actions.join('');
}

// 通用下载方法
export function download(fileName) {
	window.location.href = baseURL + "/common/download?fileName=" + encodeURI(fileName) + "&delete=" + true;
}

export function downloadFullUrl(fullFileName) {
  window.location.href = baseURL + fullFileName;
}

// 字符串格式化(%s )
export function sprintf(str) {
	var args = arguments, flag = true, i = 1;
	str = str.replace(/%s/g, function () {
		var arg = args[i++];
		if (typeof arg === 'undefined') {
			flag = false;
			return '';
		}
		return arg;
	});
	return flag ? str : '';
}

// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str) {
    if (!str || str == "undefined" || str == "null") {
        return "";
    }
    return str;
}
