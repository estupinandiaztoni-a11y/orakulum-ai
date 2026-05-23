"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaMicrophone,
  FaVolumeUp,
} from "react-icons/fa";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}