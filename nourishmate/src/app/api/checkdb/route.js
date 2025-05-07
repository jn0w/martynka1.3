import jwt from "jsonwebtoken";

const JWT_SECRET = "xJ3$R#d4e5&g7u8*V!X#p$6Jt$2y!W$Q";

export async function GET(request) {
  const cookieHeader = request.headers.get("cookie");
  console.log("Cookie Header:", cookieHeader); // Debugging log for cookie header

  if (!cookieHeader) {
    console.log("No cookie header found");
    return new Response(JSON.stringify({ message: "No token found" }), {
      status: 401,
    });
  }

  const token = cookieHeader.split("token=")[1];
  console.log("Extracted Token:", token); // Debugging log for extracted token

  if (!token) {
    console.log("No token found in cookie header");
    return new Response(JSON.stringify({ message: "No token found" }), {
      status: 401,
    });
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decodedToken); // Debugging log for decoded token

    // Include isAdmin, activityLevel, and goal in the response
    return new Response(
      JSON.stringify({
        ...decodedToken,
        isAdmin: decodedToken.isAdmin,
        activityLevel: decodedToken.activityLevel || "Not specified",
        goal: decodedToken.goal || "Not specified",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Token verification failed:", error); // Debugging log for errors
    return new Response(JSON.stringify({ message: "Invalid token" }), {
      status: 401,
    });
  }
}
