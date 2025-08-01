"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createProjectSchema } from "../schema";
import { z } from "zod";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";

import { useRef } from "react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateProject } from "../api/use-create-projects";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

interface CreateProjectFormProps {
    onCancel?: () => void;
}

export const CreateProjectForm = ({onCancel}: CreateProjectFormProps)=>{
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const { mutate, isPending } = useCreateProject();

    const inputRef = useRef<HTMLInputElement>(null);
    
    const schemaWithoutWorkspaceId = createProjectSchema.omit({ workspaceId: true });

    const form = useForm<z.infer<typeof schemaWithoutWorkspaceId>>({
    resolver: zodResolver(schemaWithoutWorkspaceId),
    defaultValues: {
        name: "",
        image: undefined,
    },
    });

    const onSubmit = (values: z.infer<typeof schemaWithoutWorkspaceId>) =>{
        const  finalValues = {
            ...values,
            workspaceId,
            image: values.image instanceof File ? values.image : "",
        }
        mutate({
            form: finalValues
        },{
            onSuccess: ({data})=>{
                form.reset();
                router.push(`/workspaces/${workspaceId}/projects/${data.$id}`)
            }
        });
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        const file = e.target.files?.[0];
        if(file){
            form.setValue("image", file);
        }
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">
                    Create a new project
                </CardTitle>
            </CardHeader>
            <div className="px-7">
               <DottedSeparator/> 
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>
                                            Project Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter project name"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <div className="flex flex-col gap-y-2">
                                        <div className="flex items-center gap-x-5">
                                            {field.value ? (
                                                <div className="size-[72px] relative rounded-md overflow-hidden">
                                                    <Image
                                                        alt="logo"
                                                        fill
                                                        className="object-cover"
                                                        src={
                                                            field.value instanceof File ? URL.createObjectURL(field.value) : field.value
                                                        }
                                                    />
                                                </div>
                                            ): (
                                                <Avatar className="size-[72px]">
                                                    <AvatarFallback>
                                                        <ImageIcon className="size-[36px] text-neutral-400"/>
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className="flex flex-col">
                                                <p className="text-sm">Project Icon</p>
                                                <p className="text-sm text-muted-foreground">
                                                    JPG, PNG, SVG or JPEG, max 1MB
                                                </p>
                                                <input
                                                    className="hidden"
                                                    type="file"
                                                    accept=".jpg, .png, .jpeg, .svg"
                                                    ref={inputRef}
                                                    onChange={handleImageChange}
                                                    disabled={isPending}
                                                />
                                                {field.value ? (
                                                <Button 
                                                    type="button"
                                                    disabled={isPending}
                                                    variant="destructive"
                                                    size="xs"
                                                    className="w-fit mt-2"
                                                    onClick={()=> {
                                                        field.onChange(null);
                                                        if(inputRef.current){
                                                            inputRef.current.value = "";
                                                        }
                                                    }}
                                                >
                                                    Remove Image
                                                </Button>
                                                ) : (
                                                    <Button 
                                                        type="button"
                                                        disabled={isPending}
                                                        variant="teritary"
                                                        size="xs"
                                                        className="w-fit mt-2"
                                                        onClick={()=> inputRef.current?.click()}
                                                        >
                                                            Upload Image
                                                    </Button>
                                                ) }
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                        <DottedSeparator className="py-7"/>
                        <div className="flex items-center justify-between">
                            <Button 
                                type="button" 
                                size="lg" 
                                variant="secondary" 
                                onClick={onCancel}
                                disabled={isPending}
                                className={cn(!onCancel && "invisible")}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" size="lg" variant="primary">
                                Create Project
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}