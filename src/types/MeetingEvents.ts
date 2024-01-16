/**
 * Enum representing application events related to meetings.
 */
export enum ApplicationEvent {
  /**
   * Event triggered when a meeting is created.
   */
  MEETING_CREATE = 'meeting.create',

  /**
   * Event triggered when a meeting is updated.
   */
  MEETING_UPDATE = 'meeting.update',

  /**
   * Event triggered when a meeting is deleted.
   */
  MEETING_DELETE = 'meeting.delete',

  /**
   * Event triggered when a meeting starts.
   */
  MEETING_START = 'meeting.start',

  /**
   * Event triggered when a meeting ends.
   */
  MEETING_END = 'meeting.end',

  /**
   * Event triggered before a meeting starts.
   */
  MEETING_BEFORE_START = 'meeting.beforeStart',

  /**
   * Event triggered for meeting cleaning.
   */
  MEETING_CLEANING = 'meeting.cleaning',

  /**
   * Event triggered when a conference is started.
   */
  CONFERENCE_STARTED = 'conference.started',

  /**
   * Event triggered when a conference is stopped.
   */
  CONFERENCE_STOPPED = 'conference.stopped',
}
