import { PartialType } from '@nestjs/mapped-types';
import { CreateMeetingDto } from './create-meeting.dto';

/**
 * Data transfer object for updating a meeting.
 * Inherits from the `CreateMeetingDto` class and extends it with partial properties.
 */
export class UpdateMeetingDto extends PartialType(CreateMeetingDto) {}
