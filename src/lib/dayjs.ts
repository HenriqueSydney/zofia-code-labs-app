import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import isoWeek from "dayjs/plugin/isoWeek";

import "dayjs/locale/pt-br";
import "dayjs/locale/en";

// define locale
dayjs.locale("pt-br");

// plugins
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(isoWeek);

const date = dayjs;

export { date };
