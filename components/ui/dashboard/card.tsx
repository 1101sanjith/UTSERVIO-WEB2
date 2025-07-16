'use client';
import { Edit, Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatCurrency } from '../../../src/helpers/formatCurrency';

interface CardProps {
  id: number;
  serviceName: string;
  serviceCost: string;
  serviceDescription: string;
  image: string;
  likes?: number;
  onEdit: (id: number) => void;
  onLike: (id: number) => void;
  onBuy: () => void;
  likedByUser?: boolean;
}

export default function Card({
  id,
  serviceName,
  serviceCost,
  serviceDescription,
  image,
  likes = 0,
  onEdit,
  onLike,
  onBuy,
  likedByUser,
}: CardProps) {
  return (
    <div className="bg-white rounded-2xl md:rounded-xl overflow-hidden shadow flex flex-col">
      {/* Card Header */}
      <div className="bg-[#f7f8fa] px-4 py-2 flex justify-between items-center">
        <h2 className="text-sm text-black font-medium">{serviceName}</h2>
        <button
          onClick={() => onEdit(id)}
          className="p-1 text-black"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
      {/* Image */}
      <div className="relative w-full pb-[56.25%] overflow-hidden">
        <img
          src={image}
          alt={serviceName}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>
      {/* Card Footer */}
      <div className="bg-[#f7f8fa] px-3 py-3 flex-1 flex flex-col justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-black font-medium">
              PRICE: Rs {formatCurrency(serviceCost)}
            </span>
            <div className="flex gap-2 items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(id);
                }}
                className="flex items-center"
              >
                <Heart
                  size={20}
                  className={`cursor-pointer ${
                    likedByUser ? 'fill-red-500 text-red-500' : 'text-gray-400'
                  }`}
                />
                <span className="ml-1 text-sm text-black">{likes}</span>
              </button>
              <button className="flex items-center gap-1 p-1 text-black">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 p-1 text-black">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="text-sm text-black">
            <p>{serviceDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
