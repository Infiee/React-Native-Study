import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

export { dayjs };

/**
 * 格式化时间
 * @param date Date|string|number
 * @param format string，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns string
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(date).format(format);
}

/**
 * 获取当前时间的格式化字符串
 * @param format string，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns string
 */
export function now(format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs().format(format);
}
