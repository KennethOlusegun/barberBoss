import 'dayjs';

declare module 'dayjs' {
  interface Dayjs {
    tz(timezone?: string): Dayjs;
    utc(): Dayjs;
  }

  namespace dayjs {
    interface Dayjs {
      tz(timezone?: string): Dayjs;
      utc(): Dayjs;
    }

    function tz(
      date?: string | number | Date | Dayjs,
      timezone?: string,
    ): Dayjs;

    namespace tz {
      function setDefault(timezone?: string): void;
      function guess(): string;
    }
  }
}
