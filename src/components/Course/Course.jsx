import { Table, Button, Card } from "antd";
import { GiTeacher } from "react-icons/gi";
import { FiPlusCircle, FiClock, FiBookOpen, FiXCircle } from "react-icons/fi";
import { getCourseColumns } from "./data/courseColumns";
import {
  fetchAssignedCoursesApi,
  fetchAssignedCoursesStatsApi,
} from "../../api/queries/courseQueries";
import AntdSpinner from "../Spinner/Spinner";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import AddCourse from "./add-course/AddCourse";
import AddLession from "./add-lession/AddLession";

const Course = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddCourseModal, setOpenAddCourseModal] = useState(false);

  const [openAddLessionModal, setOpenAddLessionModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const {
    data: assignedCoursesData,
    isLoading: assignedCoursesDataLoading,
    refetch: assignedCourseRefetch,
  } = useQuery({
    queryKey: ["assignedCoursesData", currentPage],
    queryFn: () => fetchAssignedCoursesApi(currentPage),
    keepPreviousData: true,
  });

  const {
    data: assignedCoursesStatsData,
    isLoading: assignedCoursesStatsDataLoading,
    refetch: assignedCourseStatsRefetch,
  } = useQuery({
    queryKey: ["assignedCoursesStatsData"],
    queryFn: () => fetchAssignedCoursesStatsApi(),
    keepPreviousData: true,
  });

  const handleAddLessionClick = (courseId) => {
    setSelectedCourseId(courseId);
    setOpenAddLessionModal(true);
  };

  const courseColumns = getCourseColumns(handleAddLessionClick);

  if (assignedCoursesDataLoading || assignedCoursesStatsDataLoading) {
    return <AntdSpinner />;
  }

  return (
    <div
      className="content-area p-4"
      style={{
        marginLeft: "250px",
        marginRight: "20px",
        marginTop: "30px",
        flexGrow: 1,
      }}
    >
      {/* heading */}
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <div>
            <GiTeacher style={{ marginRight: "10px", fontSize: "30px" }} />
          </div>
          <div>
            <h2>Courses</h2>
          </div>
        </div>
        <div style={{ marginRight: "20px" }}>
          <Button
            type="primary"
            style={{ padding: "20px 10px" }}
            onClick={() => setOpenAddCourseModal(true)}
          >
            <FiPlusCircle style={{ fontSize: "20px" }} /> Add new course
          </Button>
        </div>
      </div>

      {/* courses stats */}
      <div style={{ display: "flex", gap: "2rem" }}>
        <Card
          style={{ width: "18rem", marginTop: "30px", cursor: "pointer" }}
          bordered={true}
        >
          <Card.Meta
            avatar={<FiBookOpen style={{ fontSize: "30px" }} />}
            title="Total Courses"
            description={
              <div>
                <p style={{ fontSize: 17, fontWeight: 600 }}>
                  {assignedCoursesStatsData?.data?.totalCourses}
                </p>
              </div>
            }
          />
        </Card>

        <Card
          style={{ width: "18rem", marginTop: "30px", cursor: "pointer" }}
          bordered={true}
        >
          <Card.Meta
            avatar={<FiClock style={{ fontSize: "30px" }} />}
            title="Approval Pending"
            description={
              <div>
                <p style={{ fontSize: 17, fontWeight: 600 }}>
                  {assignedCoursesStatsData?.data?.totalPendingCourses}
                </p>
              </div>
            }
          />
        </Card>

        <Card
          style={{ width: "18rem", marginTop: "30px", cursor: "pointer" }}
          bordered={true}
        >
          <Card.Meta
            avatar={<FiXCircle style={{ fontSize: "30px" }} />}
            title="Rejected Courses"
            description={
              <div>
                <p style={{ fontSize: 17, fontWeight: 600 }}>
                  {assignedCoursesStatsData?.data?.totalDeclinedCourses}
                </p>
              </div>
            }
          />
        </Card>
      </div>

      {/* tables to see all courses */}
      <div className="mt-5">
        {assignedCoursesData && (
          <Table
            className="shadow-sm"
            columns={courseColumns}
            bordered
            dataSource={
              Array.isArray(assignedCoursesData?.data)
                ? assignedCoursesData.data
                : []
            }
            rowKey="id"
            pagination={{
              pageSize: assignedCoursesData?.pagination?.limit || 0,
              total: assignedCoursesData?.pagination?.totalCount || 0,
              onChange: (page) => setCurrentPage(page),
            }}
          />
        )}
      </div>

      {/* Add Course Modal */}
      <AddCourse
        visible={openAddCourseModal}
        onClose={() => setOpenAddCourseModal(false)}
        assignedCourseRefetch={assignedCourseRefetch}
        assignedCourseStatsRefetch={assignedCourseStatsRefetch}
      />

      {/* Add Lession Modal */}
      <AddLession
        visible={openAddLessionModal}
        onClose={() => {
          setOpenAddLessionModal(false);
          setSelectedCourseId(null);
        }}
        courseId={selectedCourseId}
      />
    </div>
  );
};

export default Course;
