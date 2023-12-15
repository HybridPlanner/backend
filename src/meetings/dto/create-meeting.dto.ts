import { MeetingStatus } from '../meetings.type';

/**
 * Data transfer object for creating a meeting.
 */
export class CreateMeetingDto {
  /**
   * The title of the meeting.
   */
  public title: string;
  /**
   * The description of the meeting (optional).
   */
  public description?: string;
  /**
   * The start date of the meeting.
   */
  public start_date: Date;
  /**
   * The end date of the meeting.
   */
  public end_date: Date;
  /**
   * The attendees of the meeting.
   */
  public attendees: string[];
  /**
   * The ID of the bubble associated with the meeting (optional).
   */
  public bubbleId?: string;
  /**
   * The public URL of the meeting (optional).
   */
  public publicUrl?: string;
  /**
   * The status of the meeting (optional).
   */
  public status?: MeetingStatus;
}
