import { Client, Account, Databases, Storage, Query, type Models, AppwriteException } from "appwrite"

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)

export const appwriteConfig = {
  databaseId: "your-database-id",
  postsCollectionId: "posts-collection-id",
  usersCollectionId: "users-collection-id",
  likesCollectionId: "likes-collection-id",
  commentsCollectionId: "comments-collection-id",
  followsCollectionId: "follows-collection-id",
  storiesCollectionId: "stories-collection-id",
  conversationsCollectionId: "conversations-collection-id",
  messagesCollectionId: "messages-collection-id",
  notificationsCollectionId: "notifications-collection-id",
  reelsCollectionId: "reels-collection-id",
  hashtagsCollectionId: "hashtags-collection-id",
  bookmarksCollectionId: "bookmarks-collection-id",
  blockedUsersCollectionId: "blocked-users-collection-id",
  bucketId: "your-bucket-id",
}

export interface User extends Models.Document {
  name: string
  email: string
  bio: string
  website: string
  avatar: string
  isPrivate: boolean
  showActivityStatus: boolean
  allowTagging: boolean
}

export interface Post extends Models.Document {
  userId: string
  caption: string
  imageId: string
}

export interface Comment extends Models.Document {
  userId: string
  postId: string
  content: string
}

export interface Like extends Models.Document {
  userId: string
  postId: string
}

export interface Follow extends Models.Document {
  followerId: string
  followedId: string
}

export interface Hashtag extends Models.Document {
  name: string
  postCount: number
}

export interface Bookmark extends Models.Document {
  userId: string
  postId: string
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const user = await account.create("unique()", email, password, name)
  const newUser = await databases.createDocument<User>(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    user.$id,
    {
      name,
      email,
      bio: "",
      website: "",
      avatar: "",
      isPrivate: false,
      showActivityStatus: true,
      allowTagging: true,
    },
  )
  return newUser
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await account.get()
    const userData = await databases.getDocument<User>(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      user.$id,
    )
    return userData
  } catch {
    return null
  }
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  return await databases.updateDocument<User>(appwriteConfig.databaseId, appwriteConfig.usersCollectionId, userId, data)
}

export async function followUser(followerId: string, followedId: string): Promise<Follow> {
  return await databases.createDocument<Follow>(
    appwriteConfig.databaseId,
    appwriteConfig.followsCollectionId,
    "unique()",
    { followerId, followedId },
  )
}

export async function unfollowUser(followerId: string, followedId: string): Promise<void> {
  const follows = await databases.listDocuments<Follow>(appwriteConfig.databaseId, appwriteConfig.followsCollectionId, [
    Query.equal("followerId", followerId),
    Query.equal("followedId", followedId),
  ])
  if (follows.documents.length > 0) {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      follows.documents[0].$id,
    )
  }
}

export async function getFollowers(userId: string): Promise<Models.DocumentList<Follow>> {
  return await databases.listDocuments<Follow>(appwriteConfig.databaseId, appwriteConfig.followsCollectionId, [
    Query.equal("followedId", userId),
  ])
}

export async function getFollowing(userId: string): Promise<Models.DocumentList<Follow>> {
  return await databases.listDocuments<Follow>(appwriteConfig.databaseId, appwriteConfig.followsCollectionId, [
    Query.equal("followerId", userId),
  ])
}

export async function createPost(caption: string, imageId: string): Promise<Post> {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  const post = await databases.createDocument<Post>(
    appwriteConfig.databaseId,
    appwriteConfig.postsCollectionId,
    "unique()",
    {
      userId: user.$id,
      caption,
      imageId,
    },
  )

  // Extract and create hashtags
  const hashtags = caption.match(/#[a-zA-Z0-9]+/g) || []
  for (const tag of hashtags) {
    await createOrUpdateHashtag(tag.slice(1))
  }

  return post
}

export async function getPosts(limit = 10, offset = 0): Promise<Models.DocumentList<Post>> {
  return await databases.listDocuments<Post>(appwriteConfig.databaseId, appwriteConfig.postsCollectionId, [
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
    Query.offset(offset),
  ])
}

export async function likePost(postId: string): Promise<Like> {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  return await databases.createDocument<Like>(appwriteConfig.databaseId, appwriteConfig.likesCollectionId, "unique()", {
    userId: user.$id,
    postId,
  })
}

export async function unlikePost(postId: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  const likes = await databases.listDocuments<Like>(appwriteConfig.databaseId, appwriteConfig.likesCollectionId, [
    Query.equal("userId", user.$id),
    Query.equal("postId", postId),
  ])

  if (likes.documents.length > 0) {
    await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.likesCollectionId, likes.documents[0].$id)
  }
}

export async function addComment(postId: string, content: string): Promise<Comment> {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  return await databases.createDocument<Comment>(
    appwriteConfig.databaseId,
    appwriteConfig.commentsCollectionId,
    "unique()",
    { userId: user.$id, postId, content },
  )
}

export async function getComments(postId: string): Promise<Models.DocumentList<Comment>> {
  return await databases.listDocuments<Comment>(appwriteConfig.databaseId, appwriteConfig.commentsCollectionId, [
    Query.equal("postId", postId),
    Query.orderDesc("$createdAt"),
  ])
}

export interface Notification extends Models.Document {
  userId: string
  type: string
  postId?: string
  createdAt: string
}

export async function createNotification(userId: string, type: string, postId?: string): Promise<Notification> {
  return await databases.createDocument<Notification>(
    appwriteConfig.databaseId,
    appwriteConfig.notificationsCollectionId,
    "unique()",
    { userId, type, postId, createdAt: new Date().toISOString() },
  )
}

export async function getNotifications(userId: string): Promise<Models.DocumentList<Notification>> {
  return await databases.listDocuments<Notification>(
    appwriteConfig.databaseId,
    appwriteConfig.notificationsCollectionId,
    [Query.equal("userId", userId), Query.orderDesc("createdAt")],
  )
}

export async function searchUsers(query: string): Promise<Models.DocumentList<User>> {
  return await databases.listDocuments<User>(appwriteConfig.databaseId, appwriteConfig.usersCollectionId, [
    Query.search("name", query),
  ])
}

export async function searchPosts(query: string): Promise<Models.DocumentList<Post>> {
  return await databases.listDocuments<Post>(appwriteConfig.databaseId, appwriteConfig.postsCollectionId, [
    Query.search("caption", query),
  ])
}

export interface Reel extends Models.Document {
  userId: string
  caption: string
  videoFileId: string
}

export async function createReel(caption: string, videoFileId: string): Promise<Reel> {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  return await databases.createDocument<Reel>(appwriteConfig.databaseId, appwriteConfig.reelsCollectionId, "unique()", {
    userId: user.$id,
    caption,
    videoFileId,
  })
}

export async function getReels(limit = 10, offset = 0): Promise<Models.DocumentList<Reel>> {
  return await databases.listDocuments<Reel>(appwriteConfig.databaseId, appwriteConfig.reelsCollectionId, [
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
    Query.offset(offset),
  ])
}

export async function createOrUpdateHashtag(name: string): Promise<Hashtag> {
  const hashtags = await databases.listDocuments<Hashtag>(
    appwriteConfig.databaseId,
    appwriteConfig.hashtagsCollectionId,
    [Query.equal("name", name)],
  )

  if (hashtags.documents.length > 0) {
    const hashtag = hashtags.documents[0]
    return await databases.updateDocument<Hashtag>(
      appwriteConfig.databaseId,
      appwriteConfig.hashtagsCollectionId,
      hashtag.$id,
      { postCount: hashtag.postCount + 1 },
    )
  } else {
    return await databases.createDocument<Hashtag>(
      appwriteConfig.databaseId,
      appwriteConfig.hashtagsCollectionId,
      "unique()",
      { name, postCount: 1 },
    )
  }
}

export async function getTrendingHashtags(limit = 10): Promise<Models.DocumentList<Hashtag>> {
  try {
    return await databases.listDocuments<Hashtag>(appwriteConfig.databaseId, appwriteConfig.hashtagsCollectionId, [
      Query.orderDesc("postCount"),
      Query.limit(limit),
    ])
  } catch (error) {
    console.error("Error in getTrendingHashtags:", error)
    if (error instanceof AppwriteException) {
      console.error("Appwrite Exception:", error.message, error.code)
    }
    throw error // Re-throw the error to be handled by the caller
  }
}

export async function bookmarkPost(postId: string): Promise<Bookmark> {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  return await databases.createDocument<Bookmark>(
    appwriteConfig.databaseId,
    appwriteConfig.bookmarksCollectionId,
    "unique()",
    { userId: user.$id, postId },
  )
}

export async function unbookmarkPost(postId: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  const bookmarks = await databases.listDocuments<Bookmark>(
    appwriteConfig.databaseId,
    appwriteConfig.bookmarksCollectionId,
    [Query.equal("userId", user.$id), Query.equal("postId", postId)],
  )

  if (bookmarks.documents.length > 0) {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.bookmarksCollectionId,
      bookmarks.documents[0].$id,
    )
  }
}

export async function getBookmarkedPosts(userId: string): Promise<Models.DocumentList<Post>> {
  const bookmarks = await databases.listDocuments<Bookmark>(
    appwriteConfig.databaseId,
    appwriteConfig.bookmarksCollectionId,
    [Query.equal("userId", userId)],
  )

  const postIds = bookmarks.documents.map((bookmark) => bookmark.postId)
  return await databases.listDocuments<Post>(appwriteConfig.databaseId, appwriteConfig.postsCollectionId, [
    Query.equal("$id", postIds),
  ])
}

export interface BlockedUser extends Models.Document {
  userId: string
  blockedUserId: string
}

export async function blockUser(blockedUserId: string): Promise<BlockedUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  return await databases.createDocument<BlockedUser>(
    appwriteConfig.databaseId,
    appwriteConfig.blockedUsersCollectionId,
    "unique()",
    { userId: user.$id, blockedUserId },
  )
}

export async function unblockUser(blockedUserId: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  const blockedUsers = await databases.listDocuments<BlockedUser>(
    appwriteConfig.databaseId,
    appwriteConfig.blockedUsersCollectionId,
    [Query.equal("userId", user.$id), Query.equal("blockedUserId", blockedUserId)],
  )

  if (blockedUsers.documents.length > 0) {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.blockedUsersCollectionId,
      blockedUsers.documents[0].$id,
    )
  }
}

export async function getBlockedUsers(userId: string): Promise<Models.DocumentList<BlockedUser>> {
  return await databases.listDocuments<BlockedUser>(
    appwriteConfig.databaseId,
    appwriteConfig.blockedUsersCollectionId,
    [Query.equal("userId", userId)],
  )
}

export async function updateUserPrivacySettings(
  userId: string,
  settings: Partial<Pick<User, "isPrivate" | "showActivityStatus" | "allowTagging">>,
): Promise<User> {
  return await databases.updateDocument<User>(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    userId,
    settings,
  )
}

export interface Message extends Models.Document {
  senderId: string
  receiverId: string
  type: "text" | "shared_post"
  content: string
}

export async function sharePost(postId: string, sharedWithUserId: string): Promise<Message> {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  return await databases.createDocument<Message>(
    appwriteConfig.databaseId,
    appwriteConfig.messagesCollectionId,
    "unique()",
    {
      senderId: user.$id,
      receiverId: sharedWithUserId,
      type: "shared_post",
      content: postId,
    },
  )
}

export interface PostAnalytics {
  likes: number
  comments: number
  shares: number
}

export async function getPostAnalytics(postId: string): Promise<PostAnalytics> {
  const likes = await databases.listDocuments<Like>(appwriteConfig.databaseId, appwriteConfig.likesCollectionId, [
    Query.equal("postId", postId),
  ])

  const comments = await databases.listDocuments<Comment>(
    appwriteConfig.databaseId,
    appwriteConfig.commentsCollectionId,
    [Query.equal("postId", postId)],
  )

  const shares = await databases.listDocuments<Message>(
    appwriteConfig.databaseId,
    appwriteConfig.messagesCollectionId,
    [Query.equal("type", "shared_post"), Query.equal("content", postId)],
  )

  return {
    likes: likes.total,
    comments: comments.total,
    shares: shares.total,
  }
}

