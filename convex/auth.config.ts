export default {
  providers: [
    {
      domain: process.env.CLERK_FRONTEND_API_URL || "https://helpful-monkey-0.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
