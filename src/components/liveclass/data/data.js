function generateRandomDate(startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (start > end) {
        throw new Error("Start date must be before end date");
    }

    const randomTime = Math.random() * (end - start) + start;

    return new Date(randomTime);
}


export const liveClassData = [
    {
      key: "1",
      classId: "1",
      title: "Django Basics",
      course: "Django",
      startTime: function(){
        const currectDate = new Date();
        currectDate.setMinutes(currectDate.getMinutes() - 5);
        return currectDate;
      }(),
      endTime: function() {
        const currectDate = new Date();
        currectDate.setHours(currectDate.getHours() + 2);
        return currectDate;
      }(),
      status: "approved",
    },
    {
      key: "2",
      classId: "2",
      title: "React Advanced",
      course: "React",
      startTime: generateRandomDate("2020-01-01", "2025-12-31"),
      endTime: generateRandomDate("2025-01-01", "2025-12-31"),
      status: "pending",
    },
    {
      key: "3",
      classId: "3",
      title: "Webhooks",
      course: "Nodejs - Basic to Advance",
      startTime: generateRandomDate("2020-01-01", "2025-12-31"),
      endTime: generateRandomDate("2025-01-01", "2025-12-31"),
      status: "pending",
    },
  ];
export const cousedummydata=[
  {
    "id": "67a47164713a252efa140c3d",
    "title": "MongoDb full course",
    "description": "Begineer friendly mongodb course",
    "level": "Begineer",
    "startDate": "2025-03-27T00:00:00.000Z",
    "endDate": "2025-04-27T00:00:00.000Z",
    "price": 65,
    "approvalStatus": "declined",
    "thumbnailImageUrl": null,
    "subject": {
        "id": "67a2f25fe95269669b4e2ff5",
        "name": "Data Structures"
    },
    "department": {
        "id": "67a2f25fe95269669b4e2feb",
        "name": "Computer Science and Engineering"
    },
    "addedBy": null,
    "category": {
        "id": "67a2f25fe95269669b4e2ffa",
        "name": "Programming"
    },
    "language": {
        "id": "67a2f25fe95269669b4e3000",
        "name": "English"
    }
},
{
    "id": "67a4714a713a252efa140c3b",
    "title": "MySQL full course",
    "description": "Begineer friendly mysql course",
    "level": "Begineer",
    "startDate": "2025-03-27T00:00:00.000Z",
    "endDate": "2025-04-27T00:00:00.000Z",
    "price": 65,
    "approvalStatus": "approved",
    "thumbnailImageUrl": null,
    "subject": {
        "id": "67a2f25fe95269669b4e2ff5",
        "name": "Data Structures"
    },
    "department": {
        "id": "67a2f25fe95269669b4e2feb",
        "name": "Computer Science and Engineering"
    },
    "addedBy": null,
    "category": {
        "id": "67a2f25fe95269669b4e2ffa",
        "name": "Programming"
    },
    "language": {
        "id": "67a2f25fe95269669b4e3000",
        "name": "English"
    }
},
{
    "id": "67a47124713a252efa140c39",
    "title": "Django Development Course",
    "description": "Begineer friendly Django course",
    "level": "Begineer",
    "startDate": "2025-03-27T00:00:00.000Z",
    "endDate": "2025-04-27T00:00:00.000Z",
    "price": 80,
    "approvalStatus": "pending",
    "thumbnailImageUrl": null,
    "subject": {
        "id": "67a2f25fe95269669b4e2ff5",
        "name": "Data Structures"
    },
    "department": {
        "id": "67a2f25fe95269669b4e2feb",
        "name": "Computer Science and Engineering"
    },
    "addedBy": null,
    "category": {
        "id": "67a2f25fe95269669b4e2ffa",
        "name": "Programming"
    },
    "language": {
        "id": "67a2f25fe95269669b4e3000",
        "name": "English"
    }
},
{
    "id": "67a47111713a252efa140c37",
    "title": "MERN Stack Development Course",
    "description": "Begineer friendly MERN Stack course",
    "level": "Begineer",
    "startDate": "2025-03-27T00:00:00.000Z",
    "endDate": "2025-04-27T00:00:00.000Z",
    "price": 85,
    "approvalStatus": "pending",
    "thumbnailImageUrl": null,
    "subject": {
        "id": "67a2f25fe95269669b4e2ff5",
        "name": "Data Structures"
    },
    "department": {
        "id": "67a2f25fe95269669b4e2feb",
        "name": "Computer Science and Engineering"
    },
    "addedBy": null,
    "category": {
        "id": "67a2f25fe95269669b4e2ffa",
        "name": "Programming"
    },
    "language": {
        "id": "67a2f25fe95269669b4e3000",
        "name": "English"
    }
},
{
    "id": "67a47086713a252efa140c35",
    "title": "Golang full course",
    "description": "Begineer friendly Golang course",
    "level": "Begineer",
    "startDate": "2025-03-27T00:00:00.000Z",
    "endDate": "2025-04-27T00:00:00.000Z",
    "price": 85,
    "approvalStatus": "approved",
    "thumbnailImageUrl": null,
    "subject": {
        "id": "67a2f25fe95269669b4e2ff5",
        "name": "Data Structures"
    },
    "department": {
        "id": "67a2f25fe95269669b4e2feb",
        "name": "Computer Science and Engineering"
    },
    "addedBy": null,
    "category": {
        "id": "67a2f25fe95269669b4e2ffa",
        "name": "Programming"
    },
    "language": {
        "id": "67a2f25fe95269669b4e3000",
        "name": "English"
    }
},
]