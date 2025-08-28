export enum YearOfStudy {
  FIRST = "First Year",
  SECOND = "Second Year",
  THIRD = "Third Year",
  FOURTH = "Fourth Year",
  MASTERS = "Masters",
  PHD = "PhD",
}

export enum DayOfWeek {
    MONDAY = "Monday",
    TUESDAY = "Tuesday",
    WEDNESDAY = "Wednesday",
    THURSDAY = "Thursday",
    FRIDAY = "Friday",
    SATURDAY = "Saturday",
    SUNDAY = "Sunday",
}

export interface TimetableEntry {
  id: string;
  created_at: string;
  program_of_study: string;
  year_of_study: YearOfStudy;
  course_code: string;
  course_name: string;
  venue: string;
  day: DayOfWeek;
  time: string;
}