export async function POST(request) {
  // Clear the token by setting the cookie with an immediate expiration
  return new Response(JSON.stringify({ message: "Logged out successfully" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `token=; HttpOnly; Path=/; Max-Age=0;`, // Setting Max-Age to 0 clears the cookie
    },
  });
}
