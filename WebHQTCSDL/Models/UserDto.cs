namespace WebHQTCSDL.Models
{
    public class UserDto
    {
        public string UserId { get; set; }
        public string HoTen { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
    }
}
