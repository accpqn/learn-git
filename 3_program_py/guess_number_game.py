#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
猜数字游戏
计算机随机生成一个数字，用户猜测这个数字
"""

import random
import time

class GuessNumberGame:
    """猜数字游戏类"""
    
    def __init__(self, min_num=1, max_num=100):
        """
        初始化游戏
        
        Args:
            min_num (int): 最小数字
            max_num (int): 最大数字
        """
        self.min_num = min_num
        self.max_num = max_num
        self.target_number = None
        self.attempts = 0
        self.max_attempts = 0
        self.game_history = []
    
    def start_new_game(self, difficulty='medium'):
        """
        开始新游戏
        
        Args:
            difficulty (str): 难度级别 ('easy', 'medium', 'hard')
        """
        # 根据难度设置参数
        if difficulty == 'easy':
            self.min_num, self.max_num = 1, 50
            self.max_attempts = 10
        elif difficulty == 'medium':
            self.min_num, self.max_num = 1, 100
            self.max_attempts = 7
        elif difficulty == 'hard':
            self.min_num, self.max_num = 1, 200
            self.max_attempts = 8
        else:
            self.min_num, self.max_num = 1, 100
            self.max_attempts = 7
        
        # 生成随机数
        self.target_number = random.randint(self.min_num, self.max_num)
        self.attempts = 0
        
        print(f"\n=== 新游戏开始 ===")
        print(f"难度: {difficulty.upper()}")
        print(f"数字范围: {self.min_num} - {self.max_num}")
        print(f"最大尝试次数: {self.max_attempts}")
        print(f"我已经想好了一个 {self.min_num} 到 {self.max_num} 之间的数字，你来猜猜看！")
    
    def make_guess(self, guess):
        """
        进行一次猜测
        
        Args:
            guess (int): 用户猜测的数字
            
        Returns:
            str: 游戏状态 ('win', 'lose', 'continue')
        """
        self.attempts += 1
        
        if guess == self.target_number:
            print(f"恭喜你！猜对了！数字就是 {self.target_number}")
            print(f"你用了 {self.attempts} 次尝试")
            self._record_game(True)
            return 'win'
        elif guess < self.target_number:
            remaining = self.max_attempts - self.attempts
            if remaining > 0:
                print(f"太小了！还有 {remaining} 次机会")
            else:
                print(f"太小了！")
        else:
            remaining = self.max_attempts - self.attempts
            if remaining > 0:
                print(f"太大了！还有 {remaining} 次机会")
            else:
                print(f"太大了！")
        
        if self.attempts >= self.max_attempts:
            print(f"游戏结束！你已经用完了所有 {self.max_attempts} 次机会")
            print(f"正确答案是: {self.target_number}")
            self._record_game(False)
            return 'lose'
        
        return 'continue'
    
    def _record_game(self, won):
        """记录游戏结果"""
        self.game_history.append({
            'won': won,
            'attempts': self.attempts,
            'target': self.target_number,
            'range': (self.min_num, self.max_num),
            'timestamp': time.strftime("%Y-%m-%d %H:%M:%S")
        })
    
    def show_statistics(self):
        """显示游戏统计"""
        if not self.game_history:
            print("还没有游戏记录")
            return
        
        total_games = len(self.game_history)
        won_games = sum(1 for game in self.game_history if game['won'])
        win_rate = (won_games / total_games) * 100
        
        print(f"\n=== 游戏统计 ===")
        print(f"总游戏次数: {total_games}")
        print(f"获胜次数: {won_games}")
        print(f"胜率: {win_rate:.1f}%")
        
        if won_games > 0:
            won_attempts = [game['attempts'] for game in self.game_history if game['won']]
            avg_attempts = sum(won_attempts) / len(won_attempts)
            print(f"平均获胜尝试次数: {avg_attempts:.1f}")

def get_difficulty():
    """获取难度选择"""
    print("\n请选择难度:")
    print("1. 简单 (1-50, 10次机会)")
    print("2. 中等 (1-100, 7次机会)")
    print("3. 困难 (1-200, 8次机会)")
    
    while True:
        choice = input("请输入选择 (1-3): ").strip()
        if choice == '1':
            return 'easy'
        elif choice == '2':
            return 'medium'
        elif choice == '3':
            return 'hard'
        else:
            print("无效选择，请输入 1、2 或 3")

def main():
    """主函数"""
    print("欢迎来到猜数字游戏！")
    
    game = GuessNumberGame()
    
    while True:
        print("\n" + "="*40)
        print("1. 开始新游戏")
        print("2. 查看统计")
        print("3. 退出游戏")
        
        choice = input("请选择操作 (1-3): ").strip()
        
        if choice == '1':
            # 开始新游戏
            difficulty = get_difficulty()
            game.start_new_game(difficulty)
            
            # 游戏循环
            while True:
                try:
                    guess_input = input(f"\n请输入你的猜测 ({game.min_num}-{game.max_num}): ")
                    guess = int(guess_input)
                    
                    if guess < game.min_num or guess > game.max_num:
                        print(f"请输入 {game.min_num} 到 {game.max_num} 之间的数字")
                        continue
                    
                    result = game.make_guess(guess)
                    
                    if result in ['win', 'lose']:
                        break
                        
                except ValueError:
                    print("请输入有效的数字")
                except KeyboardInterrupt:
                    print("\n游戏被中断")
                    break
        
        elif choice == '2':
            # 查看统计
            game.show_statistics()
        
        elif choice == '3':
            # 退出游戏
            print("感谢游戏！再见")
            break
        
        else:
            print("无效选择，请输入 1、2 或 3")

if __name__ == "__main__":
    main()
