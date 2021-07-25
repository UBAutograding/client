import React, { useState, useEffect } from 'react'
import { UserCourse, Course } from 'devu-shared-modules'

import PageWrapper from 'components/shared/layouts/pageWrapper'
import UserCourseListItem from 'components/listItems/userCourseListItem'
import Dropdown from 'components/shared/inputs/dropdown'

import RequestService from 'services/request.service'

import styles from './userCoursesListPage.scss'

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Dropped', value: 'dropped' },
]

const UserCoursesListPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userCourses, setUserCourses] = useState(new Array<UserCourse>())
  const [courses, setCourses] = useState<Record<string, Course>>({})
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'dropped'>('active')

  const fetchData = async () => {
    try {
      // The filter isn't implemented by the API yet
      const userCourses: UserCourse[] = await RequestService.get(`/api/user-courses?filterBy=${filter}`)
      const courseRequests = userCourses.map((u) => RequestService.get(`/api/courses/${u.courseId}`))
      const courses: Course[] = await Promise.all(courseRequests)

      // Mapify course ids so we can look them up more easilly via their id
      const courseMap: Record<string, Course> = {}
      for (const course of courses) courseMap[course.id || ''] = course

      setUserCourses(userCourses)
      setCourses(courseMap)
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filter])

  if (loading) return <div>Loading</div>
  if (error) return <div>{error}</div>

  const defaultOption = filterOptions.find((o) => o.value === filter)

  return (
    <PageWrapper>
      <div className={styles.filters}>
        <Dropdown
          label='Filter Courses'
          className={styles.dropdown}
          options={filterOptions}
          onChange={setFilter}
          defaultOption={defaultOption}
        />
      </div>
      {userCourses.map((userCourse) => (
        <UserCourseListItem key={userCourse.courseId} userCourse={userCourse} course={courses[userCourse.id || '']} />
      ))}
    </PageWrapper>
  )
}

export default UserCoursesListPage
