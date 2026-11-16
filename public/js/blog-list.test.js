const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "blog-list.js"), "utf8");
const context = vm.createContext({
  document: { addEventListener() {} },
});
vm.runInContext(source, context);

test("the newest-created article sorts first", () => {
  const posts = [
    { title: "Older post", _createdAt: "2026-09-25T07:25:35Z" },
    { title: "New post", _createdAt: "2026-11-16T07:19:05Z" },
  ];

  const sortedTitles = Array.from(context.sortPostsNewestFirst(posts), (post) => post.title);

  assert.deepEqual(sortedTitles, ["New post", "Older post"]);
});