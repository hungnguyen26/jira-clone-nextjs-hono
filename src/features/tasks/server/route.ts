import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schemas";
import { getMember } from "@/features/members/ultis";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { Task, TaskStatus } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";
import { email } from "zod/v4";

const app = new Hono()
    .delete(
        "/:taskId",
        sessionMiddleware,
        async(c)=>{
            const user = c.get("user");
            const databases = c.get("databases");
            const { taskId } = c.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId,
            );

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id,
            });

            if(!member) {
                return c.json({ error: "Unauthorized"}, 401)
            }

            await databases.deleteDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId,
            )

            return c.json({ data: { $id: task.$id }});

        }
    )
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({
            workspaceId: z.string(),
            projectId: z.string().nullish(),
            assigneeId: z.string().nullish(),
            status: z.nativeEnum(TaskStatus).nullish(),
            search: z.string().nullish(),
            dueDate: z.string().nullish(),

        })),
        async(c)=>{
            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const user = c.get("user");
            const {
                workspaceId,
                projectId,
                status,
                search,
                assigneeId,
                dueDate
            } = c.req.valid("query");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if(!member){
                return c.json({error: "Unauthorized"},401);
            }

            const query = [
                Query.equal("workspaceId", workspaceId),
                Query.orderDesc("$createdAt")
            ];

            if(status){
                console.log("status", status);
                query.push(Query.equal("status", status),)       
            }

            if(assigneeId){
                console.log("assigneeId", assigneeId);
                query.push(Query.equal("assigneeId", assigneeId),)       
            }

            if(dueDate){
                console.log("dueDate", dueDate);
                query.push(Query.equal("dueDate", dueDate),)       
            }

            if(search){
                console.log("search", search);
                query.push(Query.equal("search", search),)       
            }

            const tasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                query,
            );

            const projectIds = tasks.documents.map((task) => task.projectId);
            const assigneeIds = tasks.documents.map((task) => task.assigneeId);

            const projects = await databases.listDocuments<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectIds.length > 0 ? [Query.contains("$id", projectIds)] : [],
            )

            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : [],
            );  

            const assignees = await Promise.all(
                members.documents.map(async (member) =>{
                    const user = await users.get(member.userId);

                    return {
                        ...member,
                        name: user.name,
                        email: user.email
                    }
                })
            )

            const populatedTasks = tasks.documents.map((task)=>{
                const project = projects.documents.find(
                    (project) => project.$id === task.projectId,
                );
                const assignee = assignees.find(
                    (assignee) => assignee.$id === task.assigneeId,
                );

                return {
                    ...task,
                    project,
                    assignee,
                }
            })

            return c.json({
                data: {
                    ...tasks,
                    documents: populatedTasks,
                }
            })
        }
    )
    .post(
        "/",
        sessionMiddleware,
        zValidator("json", createTaskSchema),
        async(c)=>{
            const user = c.get("user");
            const databases = c.get("databases");
            const {
                name,
                status,
                workspaceId,
                projectId,
                dueDate,
                assigneeId
            } = c.req.valid("json");

            const member = await getMember({
                databases,
                workspaceId,
                userId:user.$id
            });

            if(!member){
                return c.json({error: "Unauthorized"},401);
            }

            const highestPositionTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("status", status),
                    Query.equal("workspaceId", workspaceId),
                    Query.orderAsc("position"),
                    Query.limit(1),
                ]
            );

            const newPosition = 
                highestPositionTask.documents.length > 0 
                ? highestPositionTask.documents[0].position + 1000 
                : 1000;

            const task = await databases.createDocument(
                DATABASE_ID,
                TASKS_ID,
                ID.unique(),
                {
                    name,
                    status,
                    workspaceId,
                    projectId,
                    dueDate,
                    assigneeId,
                    position: newPosition
                }
            )

            return c.json({ data: task });
        }
    )
    .patch(
        "/:taskId",
        sessionMiddleware,
        zValidator("json", createTaskSchema.partial()),
        async(c)=>{
            const user = c.get("user");
            const databases = c.get("databases");
            const {
                name,
                status,
                description,
                projectId,
                dueDate,
                assigneeId
            } = c.req.valid("json");

            const {taskId} = c.req.param();

            const existingTask = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            const member = await getMember({
                databases,
                workspaceId: existingTask.workspaceId,
                userId:user.$id
            });

            if(!member){
                return c.json({error: "Unauthorized"},401);
            }

            const task = await databases.updateDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId,
                {
                    name,
                    status,
                    projectId,
                    dueDate,
                    assigneeId,
                    description,
                }
            )

            return c.json({ data: task });
        }
    )
    .get(
        "/:taskId",
        sessionMiddleware,
        async (c)=>{
            const currentUser = c.get("user");
            const databases = c.get("databases");
            const { users} = await createAdminClient();
            const { taskId } = c.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId,
            )
            
            const currentMember = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: currentUser.$id
            });

            if(!currentMember){
                return c.json({error: "Unauthorized"},401);
            }

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                task.projectId
            );

            const member = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                task.assigneeId
            );

            const user = await users.get(member.userId);

            const assignee = {
                ...member,
                name: user,
                email: user.email,
            }

            return c.json({
                data: {
                    ...task,
                    project,
                    assignee,
                }
            })
        }
    )

export default app;