export interface PracticeSheet {
  id: string;
  name: string;
  formUrl: string;
  questions: { expression: string; answer: number }[];
}

export const PRACTICE_SHEETS: PracticeSheet[] = [
  {
    "id": "aa-2",
    "name": "AA Practice Sheet 2",
    "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSfoiYMAfZXJM3TLM21WtXqO8rka6-CesA9T3aDVqUgJYN0VCg/viewform",
    "questions": [
      {
        "expression": "5+2-6+8",
        "answer": 9
      },
      {
        "expression": "1+1+2+2",
        "answer": 6
      },
      {
        "expression": "1+2+1+3",
        "answer": 7
      },
      {
        "expression": "4-2+2+1",
        "answer": 5
      },
      {
        "expression": "8-2-3+5",
        "answer": 8
      },
      {
        "expression": "3+3-2+4",
        "answer": 8
      },
      {
        "expression": "13+31-12-10",
        "answer": 22
      },
      {
        "expression": "42-41+12-12",
        "answer": 1
      },
      {
        "expression": "23-12+23-11",
        "answer": 23
      },
      {
        "expression": "31-11+13-22",
        "answer": 11
      },
      {
        "expression": "21+52-23+11",
        "answer": 61
      },
      {
        "expression": "55+13-17+20",
        "answer": 71
      },
      {
        "expression": "85-55+12-20",
        "answer": 22
      },
      {
        "expression": "18-5+1+55",
        "answer": 69
      },
      {
        "expression": "52-2+9-54",
        "answer": 5
      },
      {
        "expression": "27-7+5+4",
        "answer": 29
      },
      {
        "expression": "16-5+7-6+5",
        "answer": 17
      },
      {
        "expression": "98-35+2-15",
        "answer": 50
      },
      {
        "expression": "4+3+12-17",
        "answer": 2
      },
      {
        "expression": "2+1+14+22",
        "answer": 39
      },
      {
        "expression": "43+45-35-3",
        "answer": 50
      },
      {
        "expression": "37-2-2+5",
        "answer": 38
      },
      {
        "expression": "75-4-1-20",
        "answer": 50
      },
      {
        "expression": "15+4-4-4",
        "answer": 11
      },
      {
        "expression": "26-3-3+13",
        "answer": 33
      },
      {
        "expression": "19-8+5-3",
        "answer": 13
      },
      {
        "expression": "17-4+9+34",
        "answer": 56
      },
      {
        "expression": "19+9+28+8",
        "answer": 64
      },
      {
        "expression": "18-4+9+18",
        "answer": 41
      },
      {
        "expression": "2+10+15-5",
        "answer": 22
      },
      {
        "expression": "13+5-16+5",
        "answer": 7
      },
      {
        "expression": "14+15+20+50",
        "answer": 99
      },
      {
        "expression": "28-13+18+22",
        "answer": 55
      },
      {
        "expression": "16+18+14-22",
        "answer": 26
      },
      {
        "expression": "15+29+22-33",
        "answer": 33
      },
      {
        "expression": "16-14+23+19",
        "answer": 44
      },
      {
        "expression": "3+18+11+8",
        "answer": 40
      },
      {
        "expression": "5+9-3+55+8",
        "answer": 74
      },
      {
        "expression": "60+1+14+19",
        "answer": 94
      },
      {
        "expression": "29-14+18-21",
        "answer": 12
      },
      {
        "expression": "33+22+1+28",
        "answer": 84
      },
      {
        "expression": "56+2-4+19",
        "answer": 73
      },
      {
        "expression": "15+50+1-11",
        "answer": 55
      },
      {
        "expression": "24+12-22+7",
        "answer": 21
      },
      {
        "expression": "21+7+17+6",
        "answer": 51
      },
      {
        "expression": "14+53+7+6",
        "answer": 80
      },
      {
        "expression": "17+19-22+6",
        "answer": 20
      },
      {
        "expression": "55+18+7+6",
        "answer": 86
      },
      {
        "expression": "21+14+26-31",
        "answer": 30
      },
      {
        "expression": "47+8+6-21",
        "answer": 40
      },
      {
        "expression": "17-2+9+4",
        "answer": 28
      },
      {
        "expression": "51+6+17-32",
        "answer": 42
      },
      {
        "expression": "28+8+8+32",
        "answer": 76
      },
      {
        "expression": "36+9+8-32",
        "answer": 21
      },
      {
        "expression": "12+25+7+14",
        "answer": 58
      },
      {
        "expression": "58+1-54+9",
        "answer": 14
      },
      {
        "expression": "42+13-14-31",
        "answer": 10
      },
      {
        "expression": "19+5+5-27",
        "answer": 2
      },
      {
        "expression": "35+20-50+7",
        "answer": 12
      },
      {
        "expression": "50+46-31+7",
        "answer": 72
      },
      {
        "expression": "45+5+8-4",
        "answer": 54
      },
      {
        "expression": "6+12+16+1",
        "answer": 35
      },
      {
        "expression": "25+12+6-11",
        "answer": 32
      },
      {
        "expression": "16+51+7-2",
        "answer": 72
      },
      {
        "expression": "15+25+7+1",
        "answer": 48
      },
      {
        "expression": "24+3+7-12",
        "answer": 22
      }
    ]
  },
  {
    "id": "aa-3",
    "name": "AA Practice Sheet 3",
    "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSfUrCREagahmDpjdPL4qyeNUjbHfUZpH85IU2ShHa3pg_KC8A/viewform",
    "questions": [
      {
        "expression": "75+9",
        "answer": 84
      },
      {
        "expression": "16+19",
        "answer": 35
      },
      {
        "expression": "31+49",
        "answer": 80
      },
      {
        "expression": "54+39-32",
        "answer": 61
      },
      {
        "expression": "97-65+28",
        "answer": 60
      },
      {
        "expression": "39+58",
        "answer": 97
      },
      {
        "expression": "77+19-25",
        "answer": 71
      },
      {
        "expression": "39+59-37",
        "answer": 61
      },
      {
        "expression": "48-13+59",
        "answer": 94
      },
      {
        "expression": "54+7",
        "answer": 61
      },
      {
        "expression": "44+26",
        "answer": 70
      },
      {
        "expression": "36+57-82",
        "answer": 11
      },
      {
        "expression": "76+19",
        "answer": 95
      },
      {
        "expression": "15+7",
        "answer": 22
      },
      {
        "expression": "32+37",
        "answer": 69
      },
      {
        "expression": "48-23+57",
        "answer": 82
      },
      {
        "expression": "32+48+16",
        "answer": 96
      },
      {
        "expression": "28+6",
        "answer": 34
      },
      {
        "expression": "97-42+36",
        "answer": 91
      },
      {
        "expression": "92-12",
        "answer": 80
      },
      {
        "expression": "27+17",
        "answer": 44
      },
      {
        "expression": "79+11",
        "answer": 90
      },
      {
        "expression": "24+5+31",
        "answer": 60
      },
      {
        "expression": "95-25+9",
        "answer": 79
      },
      {
        "expression": "62+7+11",
        "answer": 80
      },
      {
        "expression": "39-14-11",
        "answer": 14
      },
      {
        "expression": "33+56-25",
        "answer": 64
      },
      {
        "expression": "65-14-40",
        "answer": 11
      },
      {
        "expression": "43+6+21",
        "answer": 70
      },
      {
        "expression": "78+16",
        "answer": 94
      },
      {
        "expression": "33+15+11",
        "answer": 59
      },
      {
        "expression": "88-30+12",
        "answer": 70
      },
      {
        "expression": "59+23",
        "answer": 82
      },
      {
        "expression": "49-32+26",
        "answer": 43
      },
      {
        "expression": "7+42+21",
        "answer": 70
      },
      {
        "expression": "77-34+22",
        "answer": 65
      },
      {
        "expression": "9+52-1",
        "answer": 60
      },
      {
        "expression": "67-11-43",
        "answer": 13
      },
      {
        "expression": "77-32+12",
        "answer": 57
      },
      {
        "expression": "44+17",
        "answer": 61
      },
      {
        "expression": "87-23",
        "answer": 64
      },
      {
        "expression": "72-31-20",
        "answer": 21
      },
      {
        "expression": "28+56",
        "answer": 84
      },
      {
        "expression": "96-34",
        "answer": 62
      },
      {
        "expression": "55+16+24",
        "answer": 95
      },
      {
        "expression": "97-33+21",
        "answer": 85
      },
      {
        "expression": "22+69",
        "answer": 91
      },
      {
        "expression": "97-23+11",
        "answer": 85
      },
      {
        "expression": "42+39-61",
        "answer": 20
      },
      {
        "expression": "43+39",
        "answer": 82
      },
      {
        "expression": "93-53-20",
        "answer": 20
      },
      {
        "expression": "64+17",
        "answer": 81
      },
      {
        "expression": "98-55",
        "answer": 43
      },
      {
        "expression": "55+17-41",
        "answer": 31
      },
      {
        "expression": "77-32",
        "answer": 45
      },
      {
        "expression": "42+17+11",
        "answer": 70
      },
      {
        "expression": "61+29",
        "answer": 90
      },
      {
        "expression": "18+27+34",
        "answer": 79
      },
      {
        "expression": "51+24-66",
        "answer": 9
      },
      {
        "expression": "38+19",
        "answer": 57
      },
      {
        "expression": "26+59",
        "answer": 85
      },
      {
        "expression": "48+38",
        "answer": 86
      },
      {
        "expression": "68+19-26",
        "answer": 61
      },
      {
        "expression": "41+19+27",
        "answer": 87
      },
      {
        "expression": "75+19-82",
        "answer": 12
      },
      {
        "expression": "54+38",
        "answer": 92
      },
      {
        "expression": "56+39-75",
        "answer": 20
      },
      {
        "expression": "76+18",
        "answer": 94
      },
      {
        "expression": "63+29-41",
        "answer": 51
      },
      {
        "expression": "57+39",
        "answer": 96
      },
      {
        "expression": "79-55+68",
        "answer": 92
      },
      {
        "expression": "98-21+18",
        "answer": 95
      },
      {
        "expression": "69+18",
        "answer": 87
      },
      {
        "expression": "71+19",
        "answer": 90
      }
    ]
  },
  {
    "id": "aa-7",
    "name": "AA Practice Sheet 7",
    "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSfbR0K4-hfUztDVNF8fbJPZ9NW3j-2-sk-miqwyNFOSEppV5A/viewform",
    "questions": [
      {
        "expression": "5+5+6",
        "answer": 16
      },
      {
        "expression": "1+9+3",
        "answer": 13
      },
      {
        "expression": "5+8+35",
        "answer": 48
      },
      {
        "expression": "4+6+8",
        "answer": 18
      },
      {
        "expression": "6+7+31",
        "answer": 44
      },
      {
        "expression": "38-12+5",
        "answer": 31
      },
      {
        "expression": "15+13+18",
        "answer": 46
      },
      {
        "expression": "18+16-10",
        "answer": 24
      },
      {
        "expression": "47-25+20",
        "answer": 42
      },
      {
        "expression": "13+13+18",
        "answer": 44
      },
      {
        "expression": "39+26-15",
        "answer": 50
      },
      {
        "expression": "73-12-55",
        "answer": 6
      },
      {
        "expression": "33+14+10",
        "answer": 57
      },
      {
        "expression": "60+23-52",
        "answer": 31
      },
      {
        "expression": "58+30-33",
        "answer": 55
      },
      {
        "expression": "5+25+14",
        "answer": 44
      },
      {
        "expression": "14-4+51",
        "answer": 61
      },
      {
        "expression": "98-51+39",
        "answer": 86
      },
      {
        "expression": "39+20+18",
        "answer": 77
      },
      {
        "expression": "41+52-73",
        "answer": 20
      },
      {
        "expression": "88-12+18",
        "answer": 94
      },
      {
        "expression": "76-24+15",
        "answer": 67
      },
      {
        "expression": "14+25-37",
        "answer": 2
      },
      {
        "expression": "25+12-31",
        "answer": 6
      },
      {
        "expression": "12+67+12",
        "answer": 91
      },
      {
        "expression": "22+11+15",
        "answer": 48
      },
      {
        "expression": "28+29+13",
        "answer": 70
      },
      {
        "expression": "48+11-10",
        "answer": 49
      },
      {
        "expression": "66-24+25",
        "answer": 67
      },
      {
        "expression": "22+11+16",
        "answer": 49
      },
      {
        "expression": "55+13-15",
        "answer": 53
      },
      {
        "expression": "39-26-3",
        "answer": 10
      },
      {
        "expression": "45+53-52",
        "answer": 46
      },
      {
        "expression": "90-50+32",
        "answer": 72
      },
      {
        "expression": "21+44-52",
        "answer": 13
      },
      {
        "expression": "22+13-25",
        "answer": 10
      },
      {
        "expression": "23+11+11",
        "answer": 45
      },
      {
        "expression": "20+32+12",
        "answer": 64
      },
      {
        "expression": "96-55+23",
        "answer": 64
      },
      {
        "expression": "37+10+21",
        "answer": 68
      },
      {
        "expression": "36+20-23",
        "answer": 33
      },
      {
        "expression": "50+6-43",
        "answer": 13
      },
      {
        "expression": "21+12+4",
        "answer": 37
      },
      {
        "expression": "26+30-2",
        "answer": 54
      },
      {
        "expression": "35+60-81",
        "answer": 14
      },
      {
        "expression": "2+2+59",
        "answer": 63
      },
      {
        "expression": "22+53+8",
        "answer": 83
      },
      {
        "expression": "19+18-24",
        "answer": 13
      },
      {
        "expression": "99-21+7",
        "answer": 85
      },
      {
        "expression": "18+26+25",
        "answer": 69
      },
      {
        "expression": "45+16-41",
        "answer": 20
      },
      {
        "expression": "23+19-21",
        "answer": 21
      },
      {
        "expression": "2+44+50",
        "answer": 96
      },
      {
        "expression": "17+47+25",
        "answer": 89
      },
      {
        "expression": "59-4+15",
        "answer": 70
      },
      {
        "expression": "36+6-21",
        "answer": 21
      },
      {
        "expression": "52+42-43",
        "answer": 51
      },
      {
        "expression": "34+15+10",
        "answer": 59
      },
      {
        "expression": "12+16+21",
        "answer": 49
      },
      {
        "expression": "28+4+4",
        "answer": 36
      },
      {
        "expression": "83+15-42",
        "answer": 56
      },
      {
        "expression": "88+3+5",
        "answer": 96
      },
      {
        "expression": "19+2+53",
        "answer": 74
      },
      {
        "expression": "72+3+9",
        "answer": 84
      },
      {
        "expression": "59+3+15",
        "answer": 77
      },
      {
        "expression": "47+13+7",
        "answer": 67
      },
      {
        "expression": "29+31+25",
        "answer": 85
      },
      {
        "expression": "19+13+12",
        "answer": 44
      },
      {
        "expression": "78-50+22",
        "answer": 50
      },
      {
        "expression": "55+16-21",
        "answer": 50
      },
      {
        "expression": "27+27+32",
        "answer": 86
      },
      {
        "expression": "19+21+19",
        "answer": 59
      },
      {
        "expression": "39+25-13",
        "answer": 51
      }
    ]
  },
  {
    "id": "aa-9",
    "name": "AA Practice Sheet 9",
    "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSdXvEwdNsrC17cpxXq65h9KTV4CDrHXlruG-GDcPnGjZ8TcWQ/viewform",
    "questions": [
      {
        "expression": "69+6",
        "answer": 75
      },
      {
        "expression": "41+37-53",
        "answer": 25
      },
      {
        "expression": "42+5",
        "answer": 47
      },
      {
        "expression": "61+14+14",
        "answer": 89
      },
      {
        "expression": "55+24-12",
        "answer": 67
      },
      {
        "expression": "25-5+4+10",
        "answer": 34
      },
      {
        "expression": "22+22-31+50",
        "answer": 63
      },
      {
        "expression": "5+3-5-1",
        "answer": 2
      },
      {
        "expression": "23-12+33",
        "answer": 44
      },
      {
        "expression": "42-32+31",
        "answer": 41
      },
      {
        "expression": "27-7+5",
        "answer": 25
      },
      {
        "expression": "64-13+12",
        "answer": 63
      },
      {
        "expression": "3+6-8+3",
        "answer": 4
      },
      {
        "expression": "5+4-7+2",
        "answer": 4
      },
      {
        "expression": "9-6+5+1",
        "answer": 9
      },
      {
        "expression": "33+10+2",
        "answer": 45
      },
      {
        "expression": "2+21+31",
        "answer": 54
      },
      {
        "expression": "28+10+30",
        "answer": 68
      },
      {
        "expression": "41+52-73",
        "answer": 20
      },
      {
        "expression": "61+13+25",
        "answer": 99
      },
      {
        "expression": "83-61+15",
        "answer": 37
      },
      {
        "expression": "29+54",
        "answer": 83
      },
      {
        "expression": "68-34+18",
        "answer": 52
      },
      {
        "expression": "49-14+53",
        "answer": 88
      },
      {
        "expression": "77+16",
        "answer": 93
      },
      {
        "expression": "64+16",
        "answer": 80
      },
      {
        "expression": "76-24+15",
        "answer": 67
      },
      {
        "expression": "44+26",
        "answer": 70
      },
      {
        "expression": "25+53+16",
        "answer": 94
      },
      {
        "expression": "23+22",
        "answer": 45
      },
      {
        "expression": "29+11",
        "answer": 40
      },
      {
        "expression": "59+21",
        "answer": 80
      },
      {
        "expression": "16+13+11",
        "answer": 40
      },
      {
        "expression": "11+18+59",
        "answer": 88
      },
      {
        "expression": "22+23",
        "answer": 45
      },
      {
        "expression": "53+12",
        "answer": 65
      },
      {
        "expression": "54+32-65",
        "answer": 21
      },
      {
        "expression": "58+22-70",
        "answer": 10
      },
      {
        "expression": "77-26",
        "answer": 51
      },
      {
        "expression": "3+2",
        "answer": 5
      },
      {
        "expression": "54+3",
        "answer": 57
      },
      {
        "expression": "89-65+36",
        "answer": 60
      },
      {
        "expression": "77+15-82",
        "answer": 10
      },
      {
        "expression": "97-26+19",
        "answer": 90
      },
      {
        "expression": "26+42-14",
        "answer": 54
      },
      {
        "expression": "18+44",
        "answer": 62
      },
      {
        "expression": "58-9-9-9",
        "answer": 31
      },
      {
        "expression": "6+89-9-9",
        "answer": 77
      },
      {
        "expression": "5+4+9-3",
        "answer": 15
      },
      {
        "expression": "12+9+22+8",
        "answer": 51
      },
      {
        "expression": "77-39-9-8",
        "answer": 21
      },
      {
        "expression": "9+9+31+20",
        "answer": 69
      },
      {
        "expression": "46+12+22+2",
        "answer": 82
      },
      {
        "expression": "9+11+31+24",
        "answer": 75
      },
      {
        "expression": "55-54+1-2",
        "answer": 0
      },
      {
        "expression": "55-12-11+12",
        "answer": 44
      },
      {
        "expression": "78-4+2-41",
        "answer": 35
      },
      {
        "expression": "10+4+6+15",
        "answer": 35
      },
      {
        "expression": "7+7+7+15",
        "answer": 36
      },
      {
        "expression": "99-66+1-9",
        "answer": 25
      },
      {
        "expression": "41-7-4-7",
        "answer": 23
      },
      {
        "expression": "22-2-6-4",
        "answer": 10
      },
      {
        "expression": "77-27-16+11",
        "answer": 45
      },
      {
        "expression": "15+5+4+6",
        "answer": 30
      },
      {
        "expression": "4+64+4+6",
        "answer": 78
      },
      {
        "expression": "56+10-17-16",
        "answer": 33
      },
      {
        "expression": "6+24+5+5",
        "answer": 40
      },
      {
        "expression": "63-12-27+13",
        "answer": 37
      },
      {
        "expression": "55-20+5-10",
        "answer": 30
      },
      {
        "expression": "24+2+14+8",
        "answer": 48
      },
      {
        "expression": "19+11+20+12",
        "answer": 62
      }
    ]
  },
  {
    "id": "aa-10",
    "name": "AA Practice Sheet 10",
    "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSewg0HWPJzS2tQkDCP3ok_Gaig6AxNlCGM0n1bGyuxaexbdaw/viewform",
    "questions": [
      {
        "expression": "7+2+9-6+3+2-5-6",
        "answer": 6
      },
      {
        "expression": "6+2+7-411",
        "answer": -396
      },
      {
        "expression": "6+2+7-4",
        "answer": 11
      },
      {
        "expression": "9+6-1+620",
        "answer": 634
      },
      {
        "expression": "9+6-1+6",
        "answer": 20
      },
      {
        "expression": "38+41-56+1740",
        "answer": 1763
      },
      {
        "expression": "80-20+15-2253",
        "answer": -2178
      },
      {
        "expression": "45+36-20-4123",
        "answer": -4062
      },
      {
        "expression": "45+36-20-41",
        "answer": 20
      },
      {
        "expression": "34-22+68-3050",
        "answer": -2970
      },
      {
        "expression": "34-22+68-30",
        "answer": 50
      },
      {
        "expression": "77-13-44+4565",
        "answer": 4585
      },
      {
        "expression": "77-13-44+45",
        "answer": 65
      },
      {
        "expression": "25+58-30+4194",
        "answer": 4247
      },
      {
        "expression": "25+58-30+41",
        "answer": 94
      },
      {
        "expression": "25-22+43+2975",
        "answer": 3021
      },
      {
        "expression": "25-22+43+29",
        "answer": 75
      },
      {
        "expression": "85-31-10+1660",
        "answer": 1704
      },
      {
        "expression": "85-31-10+16",
        "answer": 60
      },
      {
        "expression": "65-42+54-7601",
        "answer": -7524
      },
      {
        "expression": "65-42+54-76",
        "answer": 1
      },
      {
        "expression": "65-5+35-590",
        "answer": -495
      },
      {
        "expression": "65-5+35-5",
        "answer": 90
      },
      {
        "expression": "74+10-20-361",
        "answer": -297
      },
      {
        "expression": "74+10-20-3",
        "answer": 61
      },
      {
        "expression": "87-5+10+597",
        "answer": 689
      },
      {
        "expression": "87-5+10+5",
        "answer": 97
      },
      {
        "expression": "43+11+4-3424",
        "answer": -3366
      },
      {
        "expression": "43+11+4-34",
        "answer": 24
      },
      {
        "expression": "11+3+24-1325",
        "answer": -1287
      },
      {
        "expression": "11+3+24-13",
        "answer": 25
      },
      {
        "expression": "29-18+7-1602",
        "answer": -1584
      },
      {
        "expression": "29-18+7-16",
        "answer": 2
      },
      {
        "expression": "14+22+8+3276",
        "answer": 3320
      },
      {
        "expression": "14+22+8+32",
        "answer": 76
      },
      {
        "expression": "39-27+18+5585",
        "answer": 5615
      },
      {
        "expression": "39-27+18+55",
        "answer": 85
      },
      {
        "expression": "61+12+14+987",
        "answer": 1074
      },
      {
        "expression": "19-17+14+3248",
        "answer": 3264
      },
      {
        "expression": "19-17+14+32",
        "answer": 48
      },
      {
        "expression": "28+19+2-37-1101",
        "answer": -1089
      },
      {
        "expression": "28+19+2-37-11",
        "answer": 1
      },
      {
        "expression": "12+14+6+55-2172",
        "answer": -2085
      },
      {
        "expression": "12+14+6+55-21",
        "answer": 66
      },
      {
        "expression": "12+14+6+55-2166",
        "answer": -2079
      },
      {
        "expression": "19+5+5-2702",
        "answer": -2673
      },
      {
        "expression": "19+5+5-27",
        "answer": 2
      },
      {
        "expression": "45+5+5+1873",
        "answer": 1928
      },
      {
        "expression": "45+5+5+18",
        "answer": 73
      },
      {
        "expression": "42+13-14-3110",
        "answer": -3069
      },
      {
        "expression": "42+13-14-31",
        "answer": 10
      },
      {
        "expression": "18+56-4+676",
        "answer": 746
      },
      {
        "expression": "18+56-4+6",
        "answer": 76
      },
      {
        "expression": "53-20+5+1553",
        "answer": 1591
      },
      {
        "expression": "53-20+5+15",
        "answer": 53
      },
      {
        "expression": "28+15+4+855",
        "answer": 902
      },
      {
        "expression": "28+15+4+8",
        "answer": 55
      },
      {
        "expression": "58+1-54+914",
        "answer": 919
      },
      {
        "expression": "58+1-54+9",
        "answer": 14
      },
      {
        "expression": "33+2+18+858",
        "answer": 911
      },
      {
        "expression": "33+2+18+8",
        "answer": 61
      },
      {
        "expression": "33+22+1+28",
        "answer": 84
      },
      {
        "expression": "19+9+9+21",
        "answer": 58
      },
      {
        "expression": "28+8+8+32",
        "answer": 76
      },
      {
        "expression": "17+27+2+6",
        "answer": 52
      },
      {
        "expression": "27-13+52+17",
        "answer": 83
      },
      {
        "expression": "36+9+8-32",
        "answer": 21
      },
      {
        "expression": "27+16+24+16",
        "answer": 83
      },
      {
        "expression": "12+25+7+14",
        "answer": 58
      },
      {
        "expression": "21+55+16-31",
        "answer": 61
      },
      {
        "expression": "96-23+15+6",
        "answer": 94
      },
      {
        "expression": "51+6+17-32",
        "answer": 42
      },
      {
        "expression": "32+50-31-50",
        "answer": 1
      },
      {
        "expression": "75+8-1-62+20",
        "answer": 40
      },
      {
        "expression": "24+12+8-42+6",
        "answer": 8
      },
      {
        "expression": "38-12+5+7-12",
        "answer": 26
      },
      {
        "expression": "35+6+1+18+5",
        "answer": 65
      },
      {
        "expression": "26+17+7-50+99",
        "answer": 99
      },
      {
        "expression": "13+11+6+7+56",
        "answer": 93
      },
      {
        "expression": "29-7+18+5-34",
        "answer": 11
      },
      {
        "expression": "13+7+39-54+22",
        "answer": 27
      },
      {
        "expression": "17+17+6+50+8",
        "answer": 98
      },
      {
        "expression": "45+11-1-50+7",
        "answer": 12
      },
      {
        "expression": "15-3+5+62-2",
        "answer": 77
      },
      {
        "expression": "14+12-15+22+13",
        "answer": 46
      },
      {
        "expression": "15+9+14-5-1",
        "answer": 32
      },
      {
        "expression": "73+7+9-7+4",
        "answer": 86
      },
      {
        "expression": "50+24+14-25+22",
        "answer": 85
      },
      {
        "expression": "16+18+9-22-20",
        "answer": 1
      },
      {
        "expression": "66+8+18-21+15",
        "answer": 86
      },
      {
        "expression": "5+9-3+55+8",
        "answer": 74
      }
    ]
  },
  {
    "id": "aa2-5",
    "name": "AA2 Practice Sheet 5",
    "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSfK3zwdTfY76TIxewrNMODRlPuaZwsI7UtLZRwiDkL0c2cQqQ/viewform",
    "questions": [
      {
        "expression": "21+52-23",
        "answer": 50
      },
      {
        "expression": "42-32+31",
        "answer": 41
      },
      {
        "expression": "21+52",
        "answer": 73
      },
      {
        "expression": "32-22+50",
        "answer": 60
      },
      {
        "expression": "49-25-2",
        "answer": 22
      },
      {
        "expression": "59-50+40",
        "answer": 49
      },
      {
        "expression": "37-25+11",
        "answer": 23
      },
      {
        "expression": "40+5+53",
        "answer": 98
      },
      {
        "expression": "98-35+2",
        "answer": 65
      },
      {
        "expression": "49-15-12",
        "answer": 22
      },
      {
        "expression": "74+1+11",
        "answer": 86
      },
      {
        "expression": "13+3+12",
        "answer": 28
      },
      {
        "expression": "48+11",
        "answer": 59
      },
      {
        "expression": "13+24",
        "answer": 37
      },
      {
        "expression": "34-22",
        "answer": 12
      },
      {
        "expression": "27+32",
        "answer": 59
      },
      {
        "expression": "22+4",
        "answer": 26
      },
      {
        "expression": "21+33",
        "answer": 54
      },
      {
        "expression": "28+10+30",
        "answer": 68
      },
      {
        "expression": "74+1-55",
        "answer": 20
      },
      {
        "expression": "48+11-5",
        "answer": 54
      },
      {
        "expression": "10+2+3",
        "answer": 15
      },
      {
        "expression": "92-12+8",
        "answer": 88
      },
      {
        "expression": "43+45",
        "answer": 88
      },
      {
        "expression": "22+3+13",
        "answer": 38
      },
      {
        "expression": "34+11+10",
        "answer": 55
      },
      {
        "expression": "38-20-6",
        "answer": 12
      },
      {
        "expression": "53+3-5",
        "answer": 51
      },
      {
        "expression": "99-55-2",
        "answer": 42
      },
      {
        "expression": "22+14-5",
        "answer": 31
      },
      {
        "expression": "11+21+20",
        "answer": 52
      },
      {
        "expression": "73+22-35",
        "answer": 60
      },
      {
        "expression": "18-5+14",
        "answer": 27
      },
      {
        "expression": "24+21-5",
        "answer": 40
      },
      {
        "expression": "29-21-5",
        "answer": 3
      },
      {
        "expression": "29-18+3",
        "answer": 14
      },
      {
        "expression": "63+12-5",
        "answer": 70
      },
      {
        "expression": "17-15+3",
        "answer": 5
      },
      {
        "expression": "89-86-3",
        "answer": 0
      },
      {
        "expression": "71+13+3",
        "answer": 87
      },
      {
        "expression": "19-8+5",
        "answer": 16
      },
      {
        "expression": "29+30-6",
        "answer": 53
      },
      {
        "expression": "25-14+24",
        "answer": 35
      },
      {
        "expression": "47-14+12",
        "answer": 45
      },
      {
        "expression": "88-3-23",
        "answer": 62
      },
      {
        "expression": "34+21-4",
        "answer": 51
      },
      {
        "expression": "32+13-25",
        "answer": 20
      },
      {
        "expression": "46-22+13",
        "answer": 37
      },
      {
        "expression": "42+6-4",
        "answer": 44
      },
      {
        "expression": "97-73+42",
        "answer": 66
      },
      {
        "expression": "65-12+22",
        "answer": 75
      },
      {
        "expression": "55-14+13",
        "answer": 54
      },
      {
        "expression": "63-32+24",
        "answer": 55
      },
      {
        "expression": "14+42-25",
        "answer": 31
      },
      {
        "expression": "51-40+44",
        "answer": 55
      },
      {
        "expression": "18-4+9",
        "answer": 23
      },
      {
        "expression": "17-4+8",
        "answer": 21
      },
      {
        "expression": "19+8+18",
        "answer": 45
      },
      {
        "expression": "66+8+18",
        "answer": 92
      },
      {
        "expression": "16-14+23",
        "answer": 25
      },
      {
        "expression": "3+18+11",
        "answer": 32
      },
      {
        "expression": "15+28+12",
        "answer": 55
      },
      {
        "expression": "29-14-5",
        "answer": 10
      },
      {
        "expression": "58+11-4",
        "answer": 65
      },
      {
        "expression": "25+18-22",
        "answer": 21
      },
      {
        "expression": "5+29+58",
        "answer": 92
      },
      {
        "expression": "27-3+16",
        "answer": 40
      },
      {
        "expression": "21+15+58",
        "answer": 94
      },
      {
        "expression": "35+19-33",
        "answer": 21
      },
      {
        "expression": "14+56+15",
        "answer": 85
      },
      {
        "expression": "47+7+16",
        "answer": 70
      },
      {
        "expression": "58+1+9",
        "answer": 68
      },
      {
        "expression": "4+9+18",
        "answer": 31
      },
      {
        "expression": "55+29",
        "answer": 84
      },
      {
        "expression": "12+4+11",
        "answer": 27
      }
    ]
  },
  {
    "id": "aa2-6",
    "name": "AA2 Practice Sheet 6",
    "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSeLjXJ1mgQtHaH1WMw3sOMi8rBVCW-t-_AAGRNT8KOjKc6bFA/viewform",
    "questions": [
      {
        "expression": "55+4",
        "answer": 59
      },
      {
        "expression": "33-1-10",
        "answer": 22
      },
      {
        "expression": "24+5-27",
        "answer": 2
      },
      {
        "expression": "9+50-6",
        "answer": 53
      },
      {
        "expression": "4-2+24",
        "answer": 26
      },
      {
        "expression": "9+90-79",
        "answer": 20
      },
      {
        "expression": "52+1+41",
        "answer": 94
      },
      {
        "expression": "23+32-11",
        "answer": 44
      },
      {
        "expression": "24+31+23",
        "answer": 78
      },
      {
        "expression": "44+4-16",
        "answer": 32
      },
      {
        "expression": "17-5+12",
        "answer": 24
      },
      {
        "expression": "3+43+42",
        "answer": 88
      },
      {
        "expression": "14-3+21",
        "answer": 32
      },
      {
        "expression": "13+40+12",
        "answer": 65
      },
      {
        "expression": "68-42-3",
        "answer": 23
      },
      {
        "expression": "75-11-42",
        "answer": 22
      },
      {
        "expression": "61+5-14",
        "answer": 52
      },
      {
        "expression": "25-13+44",
        "answer": 56
      },
      {
        "expression": "85-3+16",
        "answer": 98
      },
      {
        "expression": "89-43-13",
        "answer": 33
      },
      {
        "expression": "31+14-13",
        "answer": 32
      },
      {
        "expression": "42+11+2",
        "answer": 55
      },
      {
        "expression": "9+60-43",
        "answer": 26
      },
      {
        "expression": "11+75-35",
        "answer": 51
      },
      {
        "expression": "31+24-5",
        "answer": 50
      },
      {
        "expression": "31+14-20",
        "answer": 25
      },
      {
        "expression": "69+14-42",
        "answer": 41
      },
      {
        "expression": "27+13+55",
        "answer": 95
      },
      {
        "expression": "43+20-33",
        "answer": 30
      },
      {
        "expression": "31+22+4",
        "answer": 57
      },
      {
        "expression": "47+19+14",
        "answer": 80
      },
      {
        "expression": "88-14-60",
        "answer": 14
      },
      {
        "expression": "39+18-32",
        "answer": 25
      },
      {
        "expression": "16+38-20",
        "answer": 34
      },
      {
        "expression": "29+18+11",
        "answer": 58
      },
      {
        "expression": "97-3-60",
        "answer": 34
      },
      {
        "expression": "27-12+32",
        "answer": 47
      },
      {
        "expression": "45+16-21",
        "answer": 40
      },
      {
        "expression": "25+29+18",
        "answer": 72
      },
      {
        "expression": "14+24+11",
        "answer": 49
      },
      {
        "expression": "47-22+12",
        "answer": 37
      },
      {
        "expression": "5+25+14",
        "answer": 44
      },
      {
        "expression": "40+11+24",
        "answer": 75
      },
      {
        "expression": "4+35+16",
        "answer": 55
      },
      {
        "expression": "26+4+12",
        "answer": 42
      },
      {
        "expression": "36-6+14",
        "answer": 44
      },
      {
        "expression": "4+94-6",
        "answer": 92
      },
      {
        "expression": "45+15+14",
        "answer": 74
      },
      {
        "expression": "29+4+55",
        "answer": 88
      },
      {
        "expression": "39+19-11",
        "answer": 47
      },
      {
        "expression": "15+52-31",
        "answer": 36
      },
      {
        "expression": "27-13+35",
        "answer": 49
      },
      {
        "expression": "16+44+15",
        "answer": 75
      },
      {
        "expression": "34+4+13",
        "answer": 51
      },
      {
        "expression": "69+13-11",
        "answer": 71
      },
      {
        "expression": "32+12+25",
        "answer": 69
      },
      {
        "expression": "14+69-42",
        "answer": 41
      },
      {
        "expression": "57+15+13",
        "answer": 85
      },
      {
        "expression": "15+18+52",
        "answer": 85
      },
      {
        "expression": "37-14+28",
        "answer": 51
      },
      {
        "expression": "34+50+12",
        "answer": 96
      },
      {
        "expression": "24+55-13",
        "answer": 66
      },
      {
        "expression": "25+32+17",
        "answer": 74
      },
      {
        "expression": "39-22+13",
        "answer": 30
      },
      {
        "expression": "19+13+21",
        "answer": 53
      },
      {
        "expression": "57+11+12",
        "answer": 80
      },
      {
        "expression": "21+19+17",
        "answer": 57
      }
    ]
  },
  {
    "id": "aa2-8",
    "name": "AA2 Practice Sheet 8",
    "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSdZzZjgub-4oajbCGZfTvq0MGb5BUCNU8Mmku1_tYiNoansCA/viewform",
    "questions": [
      {
        "expression": "66+9",
        "answer": 75
      },
      {
        "expression": "24+9",
        "answer": 33
      },
      {
        "expression": "31+49",
        "answer": 80
      },
      {
        "expression": "53+38",
        "answer": 91
      },
      {
        "expression": "28+39-52",
        "answer": 15
      },
      {
        "expression": "54+39-32",
        "answer": 61
      },
      {
        "expression": "39+59-37",
        "answer": 61
      },
      {
        "expression": "34+15",
        "answer": 49
      },
      {
        "expression": "15+79",
        "answer": 94
      },
      {
        "expression": "7+6",
        "answer": 13
      },
      {
        "expression": "5+7",
        "answer": 12
      },
      {
        "expression": "73+7",
        "answer": 80
      },
      {
        "expression": "57+6",
        "answer": 63
      },
      {
        "expression": "68+19-26",
        "answer": 61
      },
      {
        "expression": "21+18+38",
        "answer": 77
      },
      {
        "expression": "98-21+18",
        "answer": 95
      },
      {
        "expression": "36+6",
        "answer": 42
      },
      {
        "expression": "69+6",
        "answer": 75
      },
      {
        "expression": "19+47",
        "answer": 66
      },
      {
        "expression": "38+37",
        "answer": 75
      },
      {
        "expression": "41+36",
        "answer": 77
      },
      {
        "expression": "44+26",
        "answer": 70
      },
      {
        "expression": "76+16-52",
        "answer": 40
      },
      {
        "expression": "59+27-35",
        "answer": 51
      },
      {
        "expression": "49-37+46",
        "answer": 58
      },
      {
        "expression": "6+5",
        "answer": 11
      },
      {
        "expression": "3+4",
        "answer": 7
      },
      {
        "expression": "6+4",
        "answer": 10
      },
      {
        "expression": "8+4",
        "answer": 12
      },
      {
        "expression": "24+5",
        "answer": 29
      },
      {
        "expression": "72+4",
        "answer": 76
      },
      {
        "expression": "13+4",
        "answer": 17
      },
      {
        "expression": "35+30+12",
        "answer": 77
      },
      {
        "expression": "45+51-33",
        "answer": 63
      },
      {
        "expression": "26+42-14",
        "answer": 54
      },
      {
        "expression": "18+26+25",
        "answer": 69
      },
      {
        "expression": "6+3",
        "answer": 9
      },
      {
        "expression": "3+2",
        "answer": 5
      },
      {
        "expression": "6+2",
        "answer": 8
      },
      {
        "expression": "8+2",
        "answer": 10
      },
      {
        "expression": "73+2",
        "answer": 75
      },
      {
        "expression": "79+3",
        "answer": 82
      },
      {
        "expression": "33+3",
        "answer": 36
      },
      {
        "expression": "78+12",
        "answer": 90
      },
      {
        "expression": "22+18",
        "answer": 40
      },
      {
        "expression": "53+12",
        "answer": 65
      },
      {
        "expression": "15+54+23",
        "answer": 92
      },
      {
        "expression": "73+12-55",
        "answer": 30
      },
      {
        "expression": "64+1",
        "answer": 65
      },
      {
        "expression": "49+11",
        "answer": 60
      },
      {
        "expression": "22+17+41",
        "answer": 80
      },
      {
        "expression": "59+21-70",
        "answer": 10
      },
      {
        "expression": "16+11+19",
        "answer": 46
      },
      {
        "expression": "98-51+39",
        "answer": 86
      },
      {
        "expression": "76+16-51",
        "answer": 41
      },
      {
        "expression": "25+53+16",
        "answer": 94
      },
      {
        "expression": "98-51+14",
        "answer": 61
      },
      {
        "expression": "39+14-11",
        "answer": 42
      },
      {
        "expression": "46-32+17",
        "answer": 31
      },
      {
        "expression": "96-64+23",
        "answer": 55
      },
      {
        "expression": "37+31-41",
        "answer": 27
      },
      {
        "expression": "76-24+15",
        "answer": 67
      },
      {
        "expression": "88-45",
        "answer": 43
      },
      {
        "expression": "76-51",
        "answer": 25
      },
      {
        "expression": "89-77",
        "answer": 12
      },
      {
        "expression": "28+23",
        "answer": 51
      },
      {
        "expression": "29+54",
        "answer": 83
      },
      {
        "expression": "38+23",
        "answer": 61
      },
      {
        "expression": "64+18",
        "answer": 82
      },
      {
        "expression": "59+22",
        "answer": 81
      },
      {
        "expression": "22+57+11",
        "answer": 90
      },
      {
        "expression": "28+23+33",
        "answer": 84
      },
      {
        "expression": "87-77+48",
        "answer": 58
      },
      {
        "expression": "76-13+17",
        "answer": 80
      }
    ]
  }
];

export function getPracticeSheetById(id: string): PracticeSheet | undefined {
  return PRACTICE_SHEETS.find(sheet => sheet.id === id);
}

export function getAllPracticeSheets(): { id: string; name: string; questionCount: number }[] {
  return PRACTICE_SHEETS.map(sheet => ({
    id: sheet.id,
    name: sheet.name,
    questionCount: sheet.questions.length
  }));
}

