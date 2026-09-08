using Microsoft.AspNetCore.Mvc;
using Library.Api.Models;
using Library.Api.Dtos;
using Library.Api.Data;

namespace Library.Api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        public UsersController(LibraryDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public List<UserDto> GetAll()
        {
            return _context.Users
                .OrderBy(u => u.Name)
                .Select(u => new UserDto(u.ID, u.Name))
                .ToList();
        }

        
        [HttpPost]
        public ActionResult<UserDto> Create(CreateUserRequest createUserRequest)
        {
            var name = (createUserRequest.Name ?? "").Trim();
            if (name.Length == 0)
            {
                return BadRequest("A name is required.");
            }

            var lowered = name.ToLower();
            var existing = _context.Users.FirstOrDefault(u => u.Name.ToLower() == lowered);
            if (existing is not null)
            {
                return new UserDto(existing.ID, existing.Name);
            }

            var user = new User { Name = name };
            _context.Users.Add(user);
            _context.SaveChanges();

            return new UserDto(user.ID, user.Name);
        }
    }
}
