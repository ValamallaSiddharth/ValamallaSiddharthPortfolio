export type CodingProfileKey = 'github' | 'leetcode' | 'codechef' | 'hackerrank' | 'linkedin'

export const featuredRepoNames = ['PS-4', 'OpenCV', 'AutoFaceLock', 'Body-measurement'] as const

export const codingProfiles = {
  github: {
    name: 'GitHub',
    username: 'ValamallaSiddharth',
    url: 'https://github.com/ValamallaSiddharth',
    description: 'Projects & open source',
  },
  leetcode: {
    name: 'LeetCode',
    username: 'Vsiddharth18',
    url: 'https://leetcode.com/u/Vsiddharth18/',
    description: 'Problem solving',
  },
  codechef: {
    name: 'CodeChef',
    username: 'sid_xxx_0999',
    url: 'https://www.codechef.com/users/sid_xxx_0999',
    description: 'Competitive programming',
  },
  hackerrank: {
    name: 'HackerRank',
    username: 'vsiddharth18',
    url: 'https://www.hackerrank.com/profile/vsiddharth18',
    description: 'Skills & challenges',
  },
  linkedin: {
    name: 'LinkedIn',
    username: 'valamallasiddharth',
    url: 'https://www.linkedin.com/in/valamallasiddharth/',
    description: 'Professional network',
  },
} satisfies Record<CodingProfileKey, { name: string; username: string; url: string; description: string }>
