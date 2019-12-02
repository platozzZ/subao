// 获取 YY/MM/DD HH:MM:SS
const formatAll = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 获取 YY-MM-DD HH:MM
const formatAllTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
}
// 获取 YY-MM-DD
const formatDates = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}
// 获取 YY/MM/DD
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('/')
}
// 获取 MM/DD
const formatMd = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [month, day].map(formatNumber).join('/')
}
// 获取 HH:MM:SS
const formatTimes = date => {
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [hour, minute, second].map(formatNumber).join(':')
}
// 获取 HH:MM
const formatTime = date => {
  const hour = date.getHours()
  const minute = date.getMinutes()

  return [hour, minute].map(formatNumber).join(':')
}
// 获取 YY
const formatYear = date => {
  return date.getFullYear()
}
// 获取 MM
const formatMM = date => {
  return formatNumber(date.getMonth() + 1)
}
// 获取 MM1
const formatMMs = date => {
  return date.getMonth() + 1
}
// 获取 DD
const formatDD = date => {
  return formatNumber(date.getDate())
}
// 获取 HH
const formatHour = date => {
  return date.getHours()
}
// 获取 MM
const formatMinute = date => {
  return date.getMinutes()
}
// 计算变化多少天后的日期
function dateAddDay(d, days) {
  var d = new Date(d);
  return new Date(d.setDate(d.getDate() + days));
}
// 获得本周周日的日期
function firstDayInThisWeek(d) {
  var d = new Date(d);
  return dateAddDay(d, 0 - d.getDay());
}
const getDateStr = addDayCount => {
  var dd = new Date();
  dd.setDate(dd.getDate() + addDayCount);//获取AddDayCount天后的日期
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1;//获取当前月份的日期
  var d = dd.getDate();
  return y + '/' + (m < 10 ? '0' + m : m) + '/' + (d < 10 ? '0' + d : d);
}
const getDateNext = addDayCount => {
  var dd = new Date();
  dd.setDate(dd.getDate() + addDayCount);//获取AddDayCount天后的日期
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1;//获取当前月份的日期
  var d = dd.getDate();
  return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
}

const formatWords = date => {
  // var dd = new Date();
  // dd.setDate(dd.getDate() + addDayCount);//获取AddDayCount天后的日期
  var y = date.getFullYear();
  var m = date.getMonth() + 1;//获取当前月份的日期
  var d = date.getDate();
  return (m < 10 ? '0' + m : m) + '月' + (d < 10 ? '0' + d : d) + '日';
}

const formatWeeks = date => {
  // var dd = new Date();
  // dd.setDate(dd.getDate() + addDayCount);//获取AddDayCount天后的日期
  var day = date.getDay();
  var weeks = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  // var weeks = ["日", "一", "二", "三", "四", "五", "六"];
  var week = weeks[day]; //根据星期值，从数组中获取对应的星期字符串
  return week;
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatNumber: formatNumber,
  formatAll: formatAll,
  formatAllTime: formatAllTime,
  formatDate: formatDate,
  formatDates: formatDates,
  formatYear: formatYear,
  formatMM: formatMM,
  formatMMs: formatMMs,
  formatDD: formatDD,
  formatMd: formatMd,
  formatTime: formatTime,
  formatTimes: formatTimes,
  formatHour: formatHour,
  formatMinute: formatMinute,
  getDateStr: getDateStr,
  getDateNext: getDateNext,
  formatWords: formatWords,
  formatWeeks: formatWeeks,
  firstDayInThisWeek: firstDayInThisWeek,
  dateAddDay: dateAddDay
}
