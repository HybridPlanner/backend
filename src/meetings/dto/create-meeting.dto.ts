export class CreateMeetingDto {
  public title: string;
  public description?: string;
  public start_date: number;
  public end_date: number;
  public attendees: string[];
  public bubbleId?: string;
}
