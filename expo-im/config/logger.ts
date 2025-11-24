/**
 * https://github.com/mowispace/react-native-logs
 * 日志工具
 * 提供统一的日志输出和管理
 *
 * log.debug("Debug message");
 * log.info({ message: "hi!" });
 * log.warn({ message: "warning!" });
 * log.error({ message: "error!" });
 */
import { consoleTransport, logger } from "react-native-logs";

export const log = logger.createLogger({
  levels: {
    debug: 0,
    info: 1,
    success: 2,
    warn: 3,
    error: 4,
  },
  severity: "debug",
  transport: consoleTransport,
  transportOptions: {
    colors: {
      debug: "grey",
      info: "blueBright",
      success: "greenBright",
      warn: "yellowBright",
      error: "redBright",
    },
  },
  async: true,
  // 时间格式, "iso" | "time"
  dateFormat: "time",
  // dateFormat: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss")+' ',
  // 打印级别
  printLevel: true,
  // 打印日期
  printDate: true,
  // 对齐输出
  fixedExtLvlLength: true,
  enabled: true,
});
