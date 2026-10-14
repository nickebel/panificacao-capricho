"use client";

import React from 'react';
import { motion } from 'motion/react';

export type StoryCard = {
  text: string;
  image: string;
  name: string;
  role: string;
  imagePosition?: string;
  imageSize?: string;
};

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: StoryCard[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: '-50%' }}
        transition={{
          duration: props.duration || 18,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="story-column-track"
      >
        {[0, 1].map((copy) => (
          <React.Fragment key={copy}>
            {props.testimonials.map((story, index) => (
              <article className="story-card" key={story.name + copy + index}>
                {story.imagePosition ? (
                  <div
                    className="story-card-image"
                    role="img"
                    aria-label={story.name}
                    style={{
                      backgroundImage: 'url(' + story.image + ')',
                      backgroundSize: story.imageSize || 'cover',
                      backgroundPosition: story.imagePosition,
                    }}
                  />
                ) : (
                  <img src={story.image} alt="" loading="lazy" />
                )}
                <div className="story-card-copy">
                  <p>{story.text}</p>
                  <strong>{story.name}</strong>
                  <span>{story.role}</span>
                </div>
              </article>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};