using System.Security.Cryptography;
using GirasolesRes.Application.Interfaces.Security;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace GirasolesRes.Infrastructure.Security;

public class PasswordHasherService : IPasswordHasherService
{
    private const int SaltSize = 128 / 8; // 16 bytes
    private const int SubkeySize = 256 / 8; // 32 bytes
    private const int IterationCount = 100_000;

    public string HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);
        byte[] subkey = KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: IterationCount,
            numBytesRequested: SubkeySize);

        return $"{IterationCount}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(subkey)}";
    }

    public bool VerifyPassword(string hashedPassword, string providedPassword)
    {
        if (string.IsNullOrEmpty(hashedPassword) || string.IsNullOrEmpty(providedPassword))
        {
            return false;
        }

        var parts = hashedPassword.Split('.');
        if (parts.Length != 3)
        {
            return false;
        }

        if (!int.TryParse(parts[0], out int iterations))
        {
            return false;
        }

        byte[] salt = Convert.FromBase64String(parts[1]);
        byte[] expectedSubkey = Convert.FromBase64String(parts[2]);

        byte[] actualSubkey = KeyDerivation.Pbkdf2(
            password: providedPassword,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: iterations,
            numBytesRequested: SubkeySize);

        return CryptographicOperations.FixedTimeEquals(actualSubkey, expectedSubkey);
    }
}
