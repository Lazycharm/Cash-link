{
  "name": "SiteContent",
  "type": "object",
  "properties": {
    "slug": {
      "type": "string",
      "description": "Unique identifier for the page (e.g., 'about-us', 'privacy-policy')"
    },
    "title": {
      "type": "string",
      "description": "The title of the page"
    },
    "content": {
      "type": "string",
      "description": "The main content of the page, can be Markdown"
    }
  },
  "required": [
    "slug",
    "title",
    "content"
  ],
  "rls": {
    "read": {},
    "write": {
      "user_condition": {
        "role": "admin"
      }
    }
  }
}