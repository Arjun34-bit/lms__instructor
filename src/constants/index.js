export const envConstant = {
    SKIP_PREFLIGHT_CHECK: process.env.SKIP_PREFLIGHT_CHECK || true,
    BACKEND_BASE_URL: process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:3001/api",
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
    AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION || "us-east-1",
    AWS_BUCKET: process.env.AWS_BUCKET || "pcc",
    REACT_APP_AWS_ENDPOINT: process.env.REACT_APP_AWS_ENDPOINT || "https://s3storage.duoples.com",
    MINIO_ROOT_USER: process.env.MINIO_ROOT_USER || "",
    MINIO_ROOT_PASSWORD: process.env.MINIO_ROOT_PASSWORD || ""
};
