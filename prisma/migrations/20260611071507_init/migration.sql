-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "class_id" TEXT,
    "nisn_or_nip" TEXT,
    "alamat" TEXT,
    "telepon" TEXT,
    CONSTRAINT "Profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Profile_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    CONSTRAINT "Subject_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Subject_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Material_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    CONSTRAINT "Task_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "score" INTEGER,
    "graded_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "StudentAttendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StaffAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staff_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "clock_in" DATETIME,
    "clock_out" DATETIME,
    "status" TEXT NOT NULL,
    CONSTRAINT "StaffAttendance_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TahfidzRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "surah_name" TEXT NOT NULL,
    "start_ayat" INTEGER NOT NULL,
    "end_ayat" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "TahfidzRecord_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TahfidzRecord_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Finance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Finance_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_user_id_key" ON "Profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_nisn_or_nip_key" ON "Profile"("nisn_or_nip");

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "Class"("name");
