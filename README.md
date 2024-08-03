# Content service

This system for create and read content and news...

## install

```
npm install
```

## run project

```
npm run dev
```

```
SERVER : http://121.41.58.117:8004/api/v1/content
LOCAL : http://localhost:8004/api/v1/content
PORT : 8004
```

### Create Forum

##### URL : /createcontent

##### Method : POST

##

###

| Parameter  | Type                                      | Description   |
| :--------- | :---------------------------------------- | :------------ |
| `input`    | `[index:number,text:string,image:string]` | **Required**. |
| `category` | `string(categoryId)`                      | **Required**. |

## ||

| Parameter     | Type                 | Description   |
| :------------ | :------------------- | :------------ |
| `title`       | `string`             | **Optional**. |
| `description` | `string`             | **Optional**. |
| `photo`       | `[string]`           | **Optional**. |
| `video`       | `[string]`           | **Optional**. |
| `voice`       | `[string]`           | **Optional**. |
| `category`    | `string(categoryId)` | **Required**. |

### edit news

##### URL : /editnews/:contentId

##### Method : POST

##

###

| Parameter     | Type       | Description   |
| :------------ | :--------- | :------------ |
| `title`       | `string`   | **Optional**. |
| `description` | `string`   | **Optional**. |
| `photo`       | `[string]` | **Optional**. |
| `video`       | `[string]` | **Optional**. |
| `voice`       | `[string]` | **Optional**. |
| `category`    | `objectid` | **Optional**. |

### edit Forum

##### URL : /editme/:contentId

##### Method : POST

##

###

| Parameter     | Type       | Description   |
| :------------ | :--------- | :------------ |
| `description` | `string`   | **Optional**. |
| `photo`       | `[string]` | **Optional**. |
| `video`       | `[string]` | **Optional**. |
| `voice`       | `[string]` | **Optional**. |
| `category`    | `objectid` | **Optional**. |

### Add Comment

##### URL : /addcomment

##### Method : POST

##

###

| Parameter    | Type       | Description                                         |
| :----------- | :--------- | :-------------------------------------------------- |
| `text`       | `string`   | **Required**.                                       |
| `contentId`  | `objectId` | **Required**.                                       |
| `responseTo` | `objectId` | **Optional**. if replay bod responseTO == commentId |

### Like Or DisLike

##### URL : /likeordislike/:contentId || commentId

##### Method : POST

##

###

| Parameter | Type      | Description                                                            |
| :-------- | :-------- | :--------------------------------------------------------------------- |
| `isLiked` | `boolean` | **Required**. if isLiked == true => like : isLiked == false => disLike |

### remove news

##### URL : /delnews/:contentId

##### Method : GET

##

###

### remove forum

##### URL : /delme/:contentId

##### Method : GET

##

###

### All content me

##### URL : /allme

##### Method : GET

##

###

### All content last

##### URL : /alllast

##### Method : GET

##

###

### All content

##### URL : /all

##### Method : GET

##

###

### All content by category

##### URL : /allbycategory/:categoryId

##### Method : GET

##

###

### Search content

##### URL : /search/:word

##### Method : GET

##

###
