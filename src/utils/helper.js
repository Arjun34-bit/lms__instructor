import { addLessionApi } from "../api/queries/lessionQueries";

export const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export const addAllLectures = async (lectures) => {
  try {
    for (let lecture of lectures) {
      const formData = new FormData();

      formData.append("courseId", lecture.courseId);
      formData.append("lectureName", lecture.lectureName);
      formData.append("description", lecture.description);

      const videoMeta = [];

      lecture.videos.forEach((video) => {
        formData.append("video", video.file);
        videoMeta.push({
          title: video.title,
          description: video.description,
        });
      });

      formData.append("videos", JSON.stringify(videoMeta));

      try {
        const { data } = await addLessionApi(formData);
        console.log(`Lecture "${lecture.lectureName}" uploaded`);
        return true;
      } catch (err) {
        console.error(`Failed to upload "${lecture.lectureName}":`, err);
        return false;
      }
    }
  } catch (error) {
    console.log(error);
  }
};
