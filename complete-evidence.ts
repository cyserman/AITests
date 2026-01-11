// Complete Evidence Collection
// Timeline Events + AppClose Text Messages
// Generated: 2026-01-11T16:35:20.798Z

import { EvidenceType, VerificationStatus, EvidenceItem } from './types';

export const YOUR_CASE_DATA: EvidenceItem[] = [
  {
    "id": "EVT-0003",
    "type": EvidenceType.INCIDENT,
    "sender": "July 4th exchange incident",
    "content": "Selective enforcement and rigidity demonstrated in holiday exchange.",
    "timestamp": "2024-07-04T00:00:00.000Z",
    "hash": "qnak0d",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "CL-003",
    "lane": "CUSTODY",
    "tags": [
      "EXCHANGE"
    ],
    "reliability": "High",
    "source": "Call logs",
    "notes": "Evidence includes communications, missed/blocked exchanges."
  },
  {
    "id": "EVT-0001",
    "type": EvidenceType.DOCUMENT,
    "sender": "PFA order filed",
    "content": "Protection From Abuse order filed. Includes EPFA and follow-on PFA activity.",
    "timestamp": "2024-11-01T00:00:00.000Z",
    "hash": "uggtxf",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "PKT-001",
    "lane": "PROCEDURAL",
    "tags": [
      "PFA"
    ],
    "reliability": "High",
    "source": "Court filings",
    "notes": "Removal and leverage origin point. Evidence includes filings, orders, CY-48 context, text deletions."
  },
  {
    "id": "EVT-0002",
    "type": EvidenceType.INCIDENT,
    "sender": "Camper incident",
    "content": "Law enforcement involved. Custody interference and setup alleged.",
    "timestamp": "2024-11-23T00:00:00.000Z",
    "hash": "fhuxng",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "EVT-0002",
    "lane": "CUSTODY",
    "tags": [
      "INCIDENT"
    ],
    "reliability": "High",
    "source": "Law enforcement reports"
  },
  {
    "id": "EVT-0004",
    "type": EvidenceType.DOCUMENT,
    "sender": "Counsel withdrawal",
    "content": "Legal counsel withdrew from representation. Procedural disadvantage resulted.",
    "timestamp": "2024-12-01T00:00:00.000Z",
    "hash": "79jril",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "EVT-0004",
    "lane": "PROCEDURAL",
    "tags": [
      "COURT"
    ],
    "reliability": "High",
    "source": "Court records",
    "notes": "Evidence includes correspondence, docket entries, absence of filings."
  },
  {
    "id": "EVT-0005",
    "type": EvidenceType.INCIDENT,
    "sender": "Christmas holiday denial",
    "content": "Christmas holiday access denied. Status quo hardening demonstrated.",
    "timestamp": "2024-12-25T00:00:00.000Z",
    "hash": "95cw31",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "EVT-0005",
    "lane": "CUSTODY",
    "tags": [
      "EXCHANGE"
    ],
    "reliability": "High",
    "source": "Call logs",
    "notes": "Evidence includes call logs, AppClose blocks, holiday denial records."
  },
  {
    "id": "MSG-1",
    "type": EvidenceType.MESSAGE,
    "sender": "Chris Firey",
    "content": "17PM): You don't like the aop?",
    "timestamp": "2025-03-02T13:42:00.000Z",
    "hash": "k1be4r",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-1",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_CHRIS"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Chris Firey"
  },
  {
    "id": "MSG-2",
    "type": EvidenceType.MESSAGE,
    "sender": "Chris Firey",
    "content": "17PM): What do you want to talk about about all of a sudden?",
    "timestamp": "2025-03-31T17:16:00.000Z",
    "hash": "q7j6ff",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-2",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_CHRIS"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Chris Firey"
  },
  {
    "id": "MSG-3",
    "type": EvidenceType.MESSAGE,
    "sender": "Chris Firey",
    "content": "56PM): Hey Paige, when you get a chance, could you please confirm reciept of this message to ensure its' functionality? This the account we started months ago. I assume it should go through since you're still on it. Or we can just start over if it's not working properly or for any other reason if you want.",
    "timestamp": "2025-06-07T16:34:00.000Z",
    "hash": "nlccmn",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-3",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_CHRIS"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Chris Firey"
  },
  {
    "id": "MSG-4",
    "type": EvidenceType.MESSAGE,
    "sender": "Paige Firey",
    "content": "16PM): Yes, I received the message.",
    "timestamp": "2025-06-07T16:56:00.000Z",
    "hash": "hd7s19",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-4",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_PAIGE"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Paige Firey"
  },
  {
    "id": "MSG-5",
    "type": EvidenceType.MESSAGE,
    "sender": "Chris Firey",
    "content": "19PM): Okay great. This feels safer. As far as how I'm said to be using the boys as messengers, we were spitballing ideas of things to do with my parents and I was still under the impression that you guys had talked about the plans. Hence the disconnect. Anyways, I don't coach or control what they are sharing with you or anybody about what we do or say during our visits. I personally don't see how it's in anyone's interest to attempt to do so and seems confusing and manipulative from my perspective. If by telling you about their activities, conversations or whatever they care to share is wrong somehow then I'll seek professional advice to address the issue safely and diplomatically so we can put a concerted plan together.",
    "timestamp": "2025-06-07T17:18:00.000Z",
    "hash": "u5jxb5",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-5",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_CHRIS"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Chris Firey"
  },
  {
    "id": "MSG-6",
    "type": EvidenceType.MESSAGE,
    "sender": "Paige Firey",
    "content": "01PM): I see. We have agreed on Thursday 3:30-8pm visits and every other Sunday 10am-8pm. You have the boys on their Birthday Thursday June 12 and on Fathers day Sunday June 15th.",
    "timestamp": "2025-06-07T18:48:00.000Z",
    "hash": "3bf7w",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-6",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_PAIGE"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Paige Firey"
  },
  {
    "id": "MSG-7",
    "type": EvidenceType.MESSAGE,
    "sender": "Chris Firey",
    "content": "57AM): Its what you offered so I took it. Its nice to see them again it was like 4 months apart then but this week definitely works out holiday - wise for me. I just wish it wasn't set in stone since sometimes things/places I'd like to do/see with them fall on other days, that's all. It's definitely better than not seeing them again obviously",
    "timestamp": "2025-06-08T02:52:00.000Z",
    "hash": "c9bk29",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-7",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_CHRIS"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Chris Firey"
  },
  {
    "id": "MSG-8",
    "type": EvidenceType.MESSAGE,
    "sender": "Paige Firey",
    "content": "12PM): You have them this thursday on their birthday and on sunday Fathers Day!",
    "timestamp": "2025-06-09T12:01:00.000Z",
    "hash": "0wjjtk",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-8",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_PAIGE"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Paige Firey"
  },
  {
    "id": "MSG-9",
    "type": EvidenceType.MESSAGE,
    "sender": "Paige Firey",
    "content": "12PM): The boys saw your parents last in September 2024 when they were 4. 6/11/2025 Paige Firey on 6/11/2025 9:25AM texted (viewed by Chris Firey on 6/11/2025 7:16PM): Good morning, confirming for tomorrow for Leif and Lewie.",
    "timestamp": "2025-06-09T12:02:00.000Z",
    "hash": "f3ujuh",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-9",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_PAIGE"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Paige Firey"
  },
  {
    "id": "MSG-10",
    "type": EvidenceType.MESSAGE,
    "sender": "Chris Firey",
    "content": "17PM): Yeah what time do you want me to come by and get them?",
    "timestamp": "2025-06-11T23:17:00.000Z",
    "hash": "w9lpzb",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-10",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_CHRIS"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Chris Firey"
  },
  {
    "id": "MSG-11",
    "type": EvidenceType.MESSAGE,
    "sender": "Paige Firey",
    "content": "17PM): They have art camp until 12. What time works for you?",
    "timestamp": "2025-06-11T23:17:00.000Z",
    "hash": "vg2ics",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-11",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_PAIGE"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Paige Firey"
  },
  {
    "id": "MSG-12",
    "type": EvidenceType.MESSAGE,
    "sender": "Paige Firey",
    "content": "17PM): The normal 3:30pm",
    "timestamp": "2025-06-11T23:19:00.000Z",
    "hash": "ngbxc8",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-12",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_PAIGE"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Paige Firey"
  },
  {
    "id": "MSG-13",
    "type": EvidenceType.MESSAGE,
    "sender": "Chris Firey",
    "content": "24PM): 20 minutes away",
    "timestamp": "2025-06-12T19:18:00.000Z",
    "hash": "vzqhl7",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-13",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_CHRIS"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Chris Firey"
  },
  {
    "id": "MSG-14",
    "type": EvidenceType.MESSAGE,
    "sender": "Chris Firey",
    "content": "34PM): Still says 20 minutes I'm really moved much",
    "timestamp": "2025-06-12T19:32:00.000Z",
    "hash": "qj1wma",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-14",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_CHRIS"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Chris Firey"
  },
  {
    "id": "MSG-15",
    "type": EvidenceType.MESSAGE,
    "sender": "Chris Firey",
    "content": "34PM): I haven't really moved much it still says 16 minutes",
    "timestamp": "2025-06-12T19:33:00.000Z",
    "hash": "sk8dfk",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-15",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_CHRIS"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Chris Firey"
  },
  {
    "id": "MSG-16",
    "type": EvidenceType.MESSAGE,
    "sender": "Chris Firey",
    "content": "56PM): Here",
    "timestamp": "2025-06-12T19:56:00.000Z",
    "hash": "pl7x5d",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-16",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_CHRIS"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Chris Firey"
  },
  {
    "id": "MSG-17",
    "type": EvidenceType.MESSAGE,
    "sender": "Paige Firey",
    "content": "30AM): You're about half hr late.",
    "timestamp": "2025-06-12T19:56:00.000Z",
    "hash": "hzcr",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-17",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_PAIGE"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Paige Firey"
  },
  {
    "id": "MSG-18",
    "type": EvidenceType.MESSAGE,
    "sender": "Paige Firey",
    "content": "30AM): What time are you heading back?",
    "timestamp": "2025-06-12T23:22:00.000Z",
    "hash": "1jmz6",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-18",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_PAIGE"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Paige Firey"
  },
  {
    "id": "MSG-19",
    "type": EvidenceType.MESSAGE,
    "sender": "Chris Firey",
    "content": "23AM): Camps at 845 right?",
    "timestamp": "2025-06-13T09:31:00.000Z",
    "hash": "rfrptlc",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-19",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_CHRIS"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Chris Firey"
  },
  {
    "id": "MSG-20",
    "type": EvidenceType.MESSAGE,
    "sender": "Paige Firey",
    "content": "53AM): Ye s",
    "timestamp": "2025-06-13T10:23:00.000Z",
    "hash": "k5y4ak",
    "verified": true,
    "verificationStatus": VerificationStatus.VERIFIED,
    "isInTimeline": true,
    "exhibitCode": "APPCLOSE-20",
    "lane": "CUSTODY",
    "tags": [
      "APPCLOSE",
      "TEXT",
      "FROM_PAIGE"
    ],
    "reliability": "High",
    "source": "AppClose Messages",
    "notes": "AppClose message from Paige Firey"
  }
];
