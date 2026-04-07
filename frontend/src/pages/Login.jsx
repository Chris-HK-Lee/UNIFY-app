import { useState } from 'react';
import './Login.css';

const ACCOUNT_TYPES = [
  { label: 'Student',     value: 'student' },
  { label: 'Faculty',     value: 'faculty' },
  { label: 'Company Rep', value: 'company' },
];

const emailPlaceholder = {
  student: 'Personal Email',
  faculty: 'University Email',
  company: 'Business Email',
};

const defaultRegister = {
  fname: '',
  lname: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function User() {
}

export default User;
