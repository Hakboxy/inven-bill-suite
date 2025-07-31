
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Search, Filter, Plus, Shield, Edit, Trash, Users, UserCheck, UserX } from "lucide-react"
import { useUserManagement, UserProfile } from "@/hooks/useUserManagement"
import { CreateEditUserModal } from "@/components/CreateEditUserModal"

const UserManagement = () => {
  const { users, loading, createUser, updateUser, deleteUser, toggleUserStatus } = useUserManagement();
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.status) || 
      (statusFilter === 'inactive' && !user.status)
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleCreateUser = async (userData: any) => {
    await createUser(userData);
  }

  const handleUpdateUser = async (userData: any, userId: string) => {
    await updateUser(userId, userData);
  }

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  }

  const handleToggleStatus = async (userId: string, status: boolean) => {
    await toggleUserStatus(userId, status);
  }

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? 'default' : 'secondary'}>
        {status ? 'Active' : 'Inactive'}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'manager': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'user': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    }
    return (
      <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }

  const getUserDisplayName = (user: UserProfile) => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return firstName || lastName ? `${firstName} ${lastName}`.trim() : user.email;
  }

  const activeUsers = users.filter(u => u.status).length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const totalUsers = users.length;

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions
          </p>
        </div>
        <CreateEditUserModal
          onSave={handleCreateUser}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          }
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
            </div>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
            </div>
            <p className="text-2xl font-bold">{activeUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Administrators</p>
            </div>
            <p className="text-2xl font-bold">{adminUsers}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Users
          </CardTitle>
          <CardDescription>
            Manage user accounts and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {getUserDisplayName(user)}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(user.status)}
                        <Switch
                          checked={user.status}
                          onCheckedChange={(checked) => handleToggleStatus(user.id, checked)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreateEditUserModal
                          user={user}
                          onSave={(userData) => handleUpdateUser(userData, user.id)}
                          trigger={
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this user? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserManagement
