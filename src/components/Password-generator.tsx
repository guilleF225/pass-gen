import { useState, useCallback } from "react";

const CHAR_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
};

const generatePassword = (length: number, excludedChars: string) => {
  const allChars = Object.values(CHAR_SETS).join("");
  const availableChars = allChars
    .split("")
    .filter((char) => !excludedChars.includes(char))
    .join("");

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  return Array.from(array)
    .map((x) => availableChars[x % availableChars.length])
    .join("");
};

const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return strength;
};

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(12);
  const [excludedChars, setExcludedChars] = useState("");
  const [strength, setStrength] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const generateNewPassword = useCallback(() => {
    const newPassword = generatePassword(length, excludedChars);
    setPassword(newPassword);
    setStrength(calculatePasswordStrength(newPassword));
    setIsCopied(false);
  }, [length, excludedChars]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(password);
    setIsCopied(true);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center">
        Strong Password Generator
      </h2>

      <div className="space-y-2">
        <label htmlFor="password">Generated Password</label>
        <div className="flex space-x-2">
          <div className="relative rounded-md h-8 overflow-hidden flex-grow">
            <input
              id="password"
              value={password}
              readOnly
              className="pr-10 p-2 h-8 w-full border border-gray-300 rounded-md"
            />
            <button
              className="absolute right-0 top-0 h-full px-2   bg-gray-100 hover:bg-gray-200"
              onClick={copyToClipboard}
              disabled={!password}
            >
              {isCopied ? (
                <p className="text-sm text-green-500">Copied!</p>
              ) : (
                <p className="text-sm text-gray-500">Copy</p>
              )}
              <span className="sr-only">Copy password</span>
            </button>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={generateNewPassword}
          >
            Generate
          </button>
        </div>
      </div>

      <div className="space-y-2 flex flex-col gap-2">
        <label htmlFor="length">Password Length: {length}</label>
        <input
          type="range"
          id="length"
          min={8}
          max={32}
          step={1}
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="excluded">Excluded Characters</label>
        <input
          className="pr-10 p-2 w-full border h-8 border-gray-300 rounded-md"
          id="excluded"
          value={excludedChars}
          onChange={(e) => setExcludedChars(e.target.value)}
          placeholder="Characters to exclude"
        />
      </div>

      <div>
        <label>Password Strength</label>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${(strength / 6) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Strength: {strength} / 6 (
          {["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"][
            strength - 1
          ] || "N/A"}
          )
        </p>
      </div>
    </div>
  );
}
