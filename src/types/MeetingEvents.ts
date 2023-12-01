export enum ApplicationEvent {
  MEETING_CREATE = 'meeting.create',
  MEETING_UPDATE = 'meeting.update',
  MEETING_DELETE = 'meeting.delete',

  MEETING_START = 'meeting.start',
  MEETING_END = 'meeting.end',
  MEETING_CANCEL_END = 'meeting.cancelEnd',
  MEETING_BEFORE_START = 'meeting.beforeStart',
  MEETING_CLEANING = 'meeting.cleaning',
}
