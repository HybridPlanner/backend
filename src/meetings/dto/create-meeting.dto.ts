export class CreateMeetingDto {
  public title: string;
  public description?: string;
  public start_date: Date;
  public end_date: Date;
  public attendees: string[];
  public bubbleId?: string;
  public publicUrl?: string;
}
