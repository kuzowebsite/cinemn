"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Check, X, Clock, Users, UserX } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getAllUsers,
  getPendingRegistrations,
  getExpiredUsers,
  approveRegistration,
  rejectRegistration,
  updateUserAccess,
  type User,
  type RegistrationRequest,
} from "@/lib/user-service"

interface UserManagementProps {
  currentUserEmail: string
}

export function UserManagement({ currentUserEmail }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [pendingRequests, setPendingRequests] = useState<RegistrationRequest[]>([])
  const [expiredUsers, setExpiredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [accessStartDate, setAccessStartDate] = useState<Date>()
  const [accessEndDate, setAccessEndDate] = useState<Date>()
  const [showAccessDialog, setShowAccessDialog] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [allUsers, pending, expired] = await Promise.all([
        getAllUsers(),
        getPendingRegistrations(),
        getExpiredUsers(),
      ])

      setUsers(allUsers)
      setPendingRequests(pending)
      setExpiredUsers(expired)
    } catch (error) {
      console.error("[v0] Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApproveRegistration = async (request: RegistrationRequest) => {
    if (!accessStartDate || !accessEndDate) {
      alert("Эхлэх болон дуусах огноог сонгоно уу")
      return
    }

    try {
      await approveRegistration(request.id, accessStartDate, accessEndDate, currentUserEmail)
      await fetchData()
      setShowAccessDialog(false)
      setAccessStartDate(undefined)
      setAccessEndDate(undefined)
    } catch (error) {
      console.error("[v0] Error approving registration:", error)
      alert("Бүртгэлийг зөвшөөрөхөд алдаа гарлаа")
    }
  }

  const handleRejectRegistration = async (requestId: string) => {
    if (!confirm("Энэ бүртгэлийг татгалзах уу?")) return

    try {
      await rejectRegistration(requestId)
      await fetchData()
    } catch (error) {
      console.error("[v0] Error rejecting registration:", error)
      alert("Бүртгэлийг татгалзахад алдаа гарлаа")
    }
  }

  const handleUpdateAccess = async () => {
    if (!selectedUser || !accessStartDate || !accessEndDate) return

    try {
      await updateUserAccess(selectedUser.id, accessStartDate, accessEndDate)
      await fetchData()
      setShowAccessDialog(false)
      setSelectedUser(null)
      setAccessStartDate(undefined)
      setAccessEndDate(undefined)
    } catch (error) {
      console.error("[v0] Error updating user access:", error)
      alert("Хэрэглэгчийн эрхийг шинэчлэхэд алдаа гарлаа")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Зөвшөөрөгдсөн</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Хүлээгдэж буй</Badge>
      case "expired":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Хугацаа дууссан</Badge>
      case "rejected":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Татгалзсан</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Ачааллаж байна...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Хэрэглэгч удирдлага</h2>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Нийт: {users.length}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Хүлээгдэж буй: {pendingRequests.length}
          </div>
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4" />
            Хугацаа дууссан: {expiredUsers.length}
          </div>
        </div>
      </div>

      <Tabs defaultValue="all-users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-users">Бүх хэрэглэгч</TabsTrigger>
          <TabsTrigger value="pending-requests">Бүртгүүлэх хүсэлт ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="expired-users">Хугацаа дууссан ({expiredUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="space-y-4">
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{user.profileName}</h3>
                        {getStatusBadge(user.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">Нэвтрэх нэр: {user.displayName}</p>
                      {user.accessStartDate && user.accessEndDate && (
                        <p className="text-sm text-muted-foreground">
                          Эрхийн хугацаа: {format(user.accessStartDate, "yyyy-MM-dd")} -{" "}
                          {format(user.accessEndDate, "yyyy-MM-dd")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setAccessStartDate(user.accessStartDate)
                          setAccessEndDate(user.accessEndDate)
                          setShowAccessDialog(true)
                        }}
                      >
                        Эрх засах
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending-requests" className="space-y-4">
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{request.profileName}</h3>
                      <p className="text-sm text-muted-foreground">{request.email}</p>
                      <p className="text-sm text-muted-foreground">Нэвтрэх нэр: {request.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        Хүсэлт илгээсэн: {format(request.createdAt, "yyyy-MM-dd HH:mm")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Check className="h-4 w-4 mr-1" />
                            Зөвшөөрөх
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Бүртгэлийг зөвшөөрөх</DialogTitle>
                            <DialogDescription>{request.profileName}-ийн эрхийн хугацааг тогтооно уу</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label>Эхлэх огноо</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "justify-start text-left font-normal",
                                      !accessStartDate && "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {accessStartDate ? format(accessStartDate, "yyyy-MM-dd") : "Огноо сонгох"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={accessStartDate}
                                    onSelect={setAccessStartDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="grid gap-2">
                              <Label>Дуусах огноо</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "justify-start text-left font-normal",
                                      !accessEndDate && "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {accessEndDate ? format(accessEndDate, "yyyy-MM-dd") : "Огноо сонгох"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={accessEndDate}
                                    onSelect={setAccessEndDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={() => handleApproveRegistration(request)}>Зөвшөөрөх</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectRegistration(request.id)}
                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Татгалзах
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingRequests.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Хүлээгдэж буй бүртгэлийн хүсэлт байхгүй</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="expired-users" className="space-y-4">
          <div className="grid gap-4">
            {expiredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{user.profileName}</h3>
                        {getStatusBadge(user.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">Нэвтрэх нэр: {user.displayName}</p>
                      {user.accessEndDate && (
                        <p className="text-sm text-red-400">
                          Хугацаа дууссан: {format(user.accessEndDate, "yyyy-MM-dd")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setAccessStartDate(new Date())
                          setAccessEndDate(undefined)
                          setShowAccessDialog(true)
                        }}
                      >
                        Эрх сэргээх
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {expiredUsers.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Хугацаа дууссан хэрэглэгч байхгүй</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Access Update Dialog */}
      <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Эрхийн хугацаа засах</DialogTitle>
            <DialogDescription>{selectedUser?.profileName}-ийн эрхийн хугацааг шинэчлэх</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Эхлэх огноо</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("justify-start text-left font-normal", !accessStartDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {accessStartDate ? format(accessStartDate, "yyyy-MM-dd") : "Огноо сонгох"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={accessStartDate} onSelect={setAccessStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Дуусах огноо</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("justify-start text-left font-normal", !accessEndDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {accessEndDate ? format(accessEndDate, "yyyy-MM-dd") : "Огноо сонгох"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={accessEndDate} onSelect={setAccessEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateAccess}>Хадгалах</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
