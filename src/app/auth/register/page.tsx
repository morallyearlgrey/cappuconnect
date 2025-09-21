"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"; // Changed import
import Image from "next/image";
import { Suspense } from "react"; // Added import
import { Navbar } from "@/components/navbar";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from 'react';

const formSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  linkedin: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  bio: z.string().optional(),
  state: z.string(),
  school: z.string().optional(),
  major: z.string().optional(),
  experienceyears: z.string().optional(), 
  industry: z.string().optional(),
  skills: z.array(z.string()),
  resume: z.string().optional(),
  photo: z.string().optional(),
});

const industries = [
  "Technology & IT","Healthcare & Life Sciences","Finance & Banking","Education & Academia",
  "Engineering & Manufacturing","Marketing & Advertising","Legal & Compliance",
  "Consulting & Professional Services","Energy & Environment","Government & Public Sector",
  "Hospitality & Tourism","Arts, Entertainment & Media","Retail & Consumer Goods",
  "Real Estate & Construction","Nonprofit & Social Impact","Other"
];

const usStates = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming"
];

const skillsOptions = [
  "Software Development","Cloud Computing","Cybersecurity","Data Analysis","AI & Machine Learning",
  "Patient Care","Medical Research","Clinical Trials","Pharmaceutical Knowledge","Biotechnology Techniques",
  "Financial Analysis","Accounting","Investment Strategy","Risk Management","FinTech Tools",
  "Curriculum Development","Teaching & Mentoring","Research & Publication","Educational Technology","Student Assessment",
  "Mechanical Design","Process Optimization","CAD Software","Quality Assurance","Project Management",
  "Digital Marketing","Content Creation","SEO & SEM","Brand Management","Social Media Strategy",
  "Contract Drafting","Regulatory Knowledge","Litigation Support","Intellectual Property","Risk Assessment",
  "Strategic Planning","Business Analysis","Change Management","Client Relationship Management",
  "Renewable Energy Systems","Environmental Compliance","Sustainability Planning","Energy Auditing","Resource Management",
  "Policy Analysis","Public Administration","Grant Writing","Community Engagement","Regulatory Compliance",
  "Event Planning","Customer Service","Hotel Management","Travel Coordination","Food & Beverage Management",
  "Graphic Design","Video Production","Content Writing","Photography","Game Design",
  "Sales Strategy","Inventory Management","Merchandising","E-commerce","Customer Relationship Management",
  "Property Management","Architecture","Construction Management","Urban Planning","Cost Estimation",
  "Fundraising","Advocacy","Program Management","Community Outreach","Grant Management"
];

function RegisterForm() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter(); 
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || ''; 

   const { data: session, status } = useSession();
        const isLoggedIn = status === "authenticated"; 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: emailFromUrl,
      password: "",
      linkedin: "",
      bio: "",
      school: "",
      major: "",
      experienceyears: "",
      industry: "",
      skills: [],
      resume: "",
      photo: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        router.push("/"); 
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateAccount = () => {
    setShowConfirmation(true);
  }

  const handleConfirmSubmit = () => {
    form.handleSubmit(onSubmit)();
  }

  const maxPage = 2;

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden fixed">
                         <Navbar isLoggedIn={isLoggedIn} photo={session?.user?.image || "/caffeine.jpeg"}></Navbar>

      <div className="inset-0 fixed bg-[var(--brown)] -z-10">
        <Image src="/caffeine.jpeg" alt="photo" fill className="object-cover opacity-30 -z-11" priority />
      </div>

      <div className="flex items-center justify-center h-screen w-screen -translate-y-20 ">
            <div className="bg-[var(--white)] w-[50rem] h-[30rem] flex items-center justify-center shadow-lg rounded-lg">
                <div className="flex flex-row  w-full h-full items-center">

                    <div className="relative w-1/2 h-full p-5 flex flex-col items-center justify-center place-content-center bg-[var(--brown)] rounded-l-lg">
                        <div className="text-3xl font-bold text-[var(--tan)]">CREATE AN ACCOUNT</div>
                        
                        <div className="grid-cols-3 flex flex-row gap-20 mt-4">
                            {[0,1,2].map((i)=>(
                                <div key={i} className={`w-10 h-10 text-center place-content-center rounded-full ${currentPage===i ? "text-2xl bg-[var(--light-blue)] text-[var(--brown)]" : "text-xl bg-[var(--tan)]"}`}>
                                {i+1}
                                </div>
                            ))}
                        </div>



                    </div>

                    <div className="relative w-1/2 h-full flex flex-col items-center justify-start overflow-y-auto p-6">
                            <Form {...form}>
              <form className="space-y-6 w-full">
            {showConfirmation ? (
              <div className="">
                <h2 className="text-2xl font-bold mb-4">CONFIRM REGISTRATION</h2>
                <p className="mb-4">Are you ready to start brewing connections?</p>
                <div className="flex gap-4 flex-row">
                  <Button 
                    type="button" 
                    onClick={() => setShowConfirmation(false)}
                    variant="outline"
                    className="rounded-lg bg-[var(--white)] hover:scale-102 transition-all hover:bg-white cursor-pointer"
                  >
                    No, change my blend
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleConfirmSubmit}
                    disabled={isLoading}
                    className="rounded-lg bg-[var(--light-blue)] hover:scale-102 transition-all hover:bg-[var(--dark-blue)] cursor-pointer"
                  >
                    {isLoading ? "Creating Account..." : "Yes, pour me a cup"}
                  </Button>

                   


                    

                </div>
<div className="w-full flex justify-center mt-4">
  <div className="relative w-70 h-70">  
    <Image
      src="/spilledcoffee.png"
      alt="coffee"
      fill
      className="object-contain"
      priority
    />
  </div>
</div>
              </div>
            ) : (
              <>
            {currentPage===0 && (
              <div className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Anita" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Shower" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="anitashower@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormDescription>Must be at least 8 characters long.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentPage===1 && (
                <div className="flex flex-col gap-3">
                    
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://linkedin.com/in/yourprofile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea className="h-45" placeholder="Tell us about yourself..." {...field} />
                      </FormControl>
                      <FormDescription>Brief description about yourself (max 500 characters).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                     <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {usStates.map((state)=>(
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-row basis-2 gap-3">
                    <div className="">
                     <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select your industry" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {industries.map((industry)=>(
                            <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
                  <div className="w-full">
                <FormField
                  control={form.control}
                  name="experienceyears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl><Input type="number" min="0" max="50" placeholder="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>

                </div>
               
                 <FormField
                  control={form.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School/University</FormLabel>
                      <FormControl><Input placeholder="University of Central Florida" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Major/Field of Study</FormLabel>
                      <FormControl><Input placeholder="Computer Science" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

               
               
          <FormField control={form.control} name="skills" render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <Select value="" onValueChange={(val) => {
                  if (val && !field.value.includes(val)) {
                    field.onChange([...field.value, val]);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skills" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillsOptions.map((skill) => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-gray-200 rounded flex items-center">
                    {skill} 
                    <button type="button" onClick={() =>
                      field.onChange(field.value.filter(s => s !== skill))
                    } className="ml-2 text-red-500">×</button>
                  </span>
                ))}
              </div>
            </FormItem>
          )} />
               
                
              </div>
            )}

            {currentPage===2 && (
                <div className="flex flex-col gap-3 h-full">
                <FormField
                  control={form.control}
                  name="resume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume URL (Optional)</FormLabel>
                      <FormControl><Input placeholder="https://example.com/resume.pdf" {...field} /></FormControl>
                      <FormDescription>Link to your resume or portfolio.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Photo URL (Optional)</FormLabel>
                      <FormControl><Input placeholder="https://example.com/photo.jpg" {...field} /></FormControl>
                      <FormDescription>Link to your profile photo.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button
                type="button"
                onClick={() => setCurrentPage((prev)=>Math.max(prev-1,0))}
                disabled={currentPage===0}
                className="outline-none focus:outline-none rounded-lg bg-[var(--light-blue)] text-[var(--white)] hover:scale-102 hover:bg-[var(--dark-blue)] transition-all cursor-pointer"
              >
                Previous
              </Button>

              {currentPage < maxPage ? (
                <Button
                  type="button"
                  onClick={() => setCurrentPage((prev)=>Math.min(prev+1,maxPage))}
                    className="outline-none focus:outline-none rounded-lg bg-[var(--light-blue)] text-[var(--white)] hover:scale-102 hover:bg-[var(--dark-blue)] transition-all cursor-pointer"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleCreateAccount}
                  className="outline-none focus:outline-none rounded-lg bg-[var(--tan)] text-[var(--white)] hover:scale-102 hover:bg-[var(--brown)] transition-all cursor-pointer"
                >
                  Review & Create Account
                </Button>
              )}
            </div>
            </>
            )}
          </form>
        </Form>
                    </div>

                </div>
            </div>
        </div>

      <div className="justify-left text-left flex flex-col p-20">

        

        
      </div>
    </div>

  )
}

export default function Register() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}