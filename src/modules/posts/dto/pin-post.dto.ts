export class PinPostBodyDto {
  unpinAt: string;
}
export class PinPostDto extends PinPostBodyDto {
  postId: number;
  userId: number;
}
