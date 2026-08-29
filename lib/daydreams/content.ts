import { programs } from "@/content/fixtures/programs";
import { staff } from "@/content/fixtures/staff";
import { testimonials } from "@/content/fixtures/testimonials";
import { gallery } from "@/content/fixtures/gallery";
import { schedule } from "@/content/fixtures/schedule";
import { siteSettings } from "@/content/fixtures/site-settings";
import { classes } from "@/content/fixtures/classes";
import { trainers } from "@/content/fixtures/trainers";
import { gymSchedule } from "@/content/fixtures/gym-schedule";
import { gymGallery } from "@/content/fixtures/gym-gallery";
import { gymTestimonials } from "@/content/fixtures/gym-testimonials";
import { gymSiteSettings } from "@/content/fixtures/gym-site-settings";
import type {
  Program,
  StaffMember,
  Testimonial,
  GalleryImage,
  ScheduleBlock,
  SiteSettings,
} from "./types";

/**
 * Shared content layer for both the Daydreams and Dumbbells sides of the
 * business. The gamified game panels and the traditional site read through
 * these functions rather than querying a data source directly — today
 * that's local fixtures, later it's Sanity, and no UI code needs to change
 * when that swap happens.
 */

export async function getPrograms(): Promise<Program[]> {
  return programs;
}

export async function getStaff(): Promise<StaffMember[]> {
  return staff;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return testimonials;
}

export async function getGallery(): Promise<GalleryImage[]> {
  return gallery;
}

export async function getSchedule(): Promise<ScheduleBlock[]> {
  return schedule;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettings;
}

export async function getGymClasses(): Promise<Program[]> {
  return classes;
}

export async function getTrainers(): Promise<StaffMember[]> {
  return trainers;
}

export async function getGymSchedule(): Promise<ScheduleBlock[]> {
  return gymSchedule;
}

export async function getGymGallery(): Promise<GalleryImage[]> {
  return gymGallery;
}

export async function getGymTestimonials(): Promise<Testimonial[]> {
  return gymTestimonials;
}

export async function getGymSiteSettings(): Promise<SiteSettings> {
  return gymSiteSettings;
}
