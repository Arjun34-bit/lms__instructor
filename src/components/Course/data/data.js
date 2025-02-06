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
