// This function sends the JWT token in a secure, HTTP-Only cookie
export const sendToken = (user, statusCode, res, message, extraData = {}) => {
  // 🔑 Generate JWT using the method defined in the model
  const token = user.generateJsonWebToken(); // 👈 Make sure this matches your model method name!

  // // 🍪 Set Options for the cookie (Security Best Practices)
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true, // Prevents XSS attacks (JS cannot read this cookie)

    // 🔴 THE DYNAMIC MAGIC 🔴
    // If deployed to production (live), use true (requires HTTPS).
    // If testing locally (localhost), use false (allows HTTP).
    secure: process.env.NODE_ENV === "production",

    // sameSite: "strict", // Protects against CSRF attacks

    // If live, use "None" to allow cross-domain cookies.
    // If local, use "Lax" because "None" will fail without HTTPS.
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };

  // We don't want to send the password in the response, even if it's hashed
  user.password = undefined;

  // 🚀 Send the response WITH the cookie attached
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      message,
      token, // Optional: Keep it if mobile apps need it, remove if strict web-only
      user,
      ...extraData, // Spread any additional data (like hospital info) into the response
    });
};
